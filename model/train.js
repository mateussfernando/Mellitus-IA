/*
 * Mellitus.IA — Treino do modelo de risco de diabetes EM JAVASCRIPT (Random Forest)
 * Dataset: Kaggle "Diabetes Prediction Dataset" (Mohammed Mustafa) — ambos os sexos, ~100k registros.
 *
 * Uso:  npm run train   (baixe antes model/diabetes_prediction_dataset.csv)
 * Saída: src/lib/risk_model.json  (carregado em runtime por src/lib/riskModel.js)
 */
const fs = require('fs')
const path = require('path')
const { RandomForestClassifier } = require('ml-random-forest')

const CSV = path.join(__dirname, 'diabetes_prediction_dataset.csv')
const OUT = path.join(__dirname, '..', 'src', 'lib', 'risk_model.json')

// Ordem fixa das features (precisa casar com src/lib/riskModel.js)
const FEATURES = ['glicemia', 'hba1c', 'imc', 'idade', 'sexo', 'hipertensao']

// PRNG determinístico para reprodutibilidade
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(42)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
function median(values) {
  const v = [...values].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

function main() {
  if (!fs.existsSync(CSV)) {
    console.error(`\nERRO: dataset não encontrado em ${CSV}`)
    console.error('Baixe o "Diabetes Prediction Dataset" (Kaggle / Hugging Face) e salve nesse caminho.\n')
    process.exit(1)
  }

  console.log('Lendo dataset...')
  const text = fs.readFileSync(CSV, 'utf8').trim()
  const lines = text.split(/\r?\n/)
  const header = lines[0].split(',').map((h) => h.trim())
  const col = {}
  header.forEach((h, i) => (col[h] = i))

  const data = []
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(',')
    if (c.length < header.length) continue
    const gender = (c[col.gender] || '').trim()
    if (gender !== 'Male' && gender !== 'Female') continue // descarta "Other"

    const idade    = parseFloat(c[col.age])
    const imc      = parseFloat(c[col.bmi])
    const hba1c    = parseFloat(c[col.HbA1c_level])
    const glicemia = parseFloat(c[col.blood_glucose_level])
    const hipertensao = parseInt(c[col.hypertension], 10)
    const diabetes = parseInt(c[col.diabetes], 10)
    if ([idade, imc, hba1c, glicemia].some((v) => Number.isNaN(v))) continue

    const sexo = gender === 'Male' ? 1 : 0
    data.push({ X: [glicemia, hba1c, imc, idade, sexo, hipertensao], y: diabetes })
  }
  console.log(`Registros válidos: ${data.length.toLocaleString()}`)

  // Medianas (para imputar features ausentes em runtime) — calculadas no dataset inteiro
  const medians = {}
  FEATURES.forEach((f, idx) => { medians[f] = median(data.map((d) => d.X[idx])) })

  // Balanceamento: undersampling do majoritário (negativos) para ~1.5x os positivos.
  // Também limitamos o total de amostras: o ml-random-forest em JS puro é lento, e
  // glicemia/HbA1c são tão preditivos que poucos milhares de amostras já bastam.
  const MAX_POS = 3000
  const pos = shuffle(data.filter((d) => d.y === 1)).slice(0, MAX_POS)
  const neg = shuffle(data.filter((d) => d.y === 0)).slice(0, Math.round(pos.length * 1.5))
  const balanced = shuffle([...pos, ...neg])
  console.log(`Balanceado: ${pos.length} positivos + ${neg.length} negativos = ${balanced.length}`)

  // Split 80/20
  const cut = Math.floor(balanced.length * 0.8)
  const train = balanced.slice(0, cut)
  const test = balanced.slice(cut)
  const Xtr = train.map((d) => d.X)
  const ytr = train.map((d) => d.y)
  const Xte = test.map((d) => d.X)
  const yte = test.map((d) => d.y)

  // Treino do Random Forest
  console.log('Treinando Random Forest...')
  const clf = new RandomForestClassifier({
    seed: 42,
    nEstimators: 30,
    maxFeatures: 0.8,
    replacement: true,
    useSampleBagging: true,
    noOOB: true, // pula o cálculo out-of-bag (grande ganho de velocidade)
    treeOptions: { maxDepth: 9, minNumSamples: 15 },
  })
  clf.train(Xtr, ytr)

  // Avaliação
  const probs = clf.predictProbability(Xte, 1)
  const preds = probs.map((p) => (p >= 0.5 ? 1 : 0))

  let tp = 0, tn = 0, fp = 0, fn = 0
  for (let i = 0; i < yte.length; i++) {
    if (yte[i] === 1 && preds[i] === 1) tp++
    else if (yte[i] === 0 && preds[i] === 0) tn++
    else if (yte[i] === 0 && preds[i] === 1) fp++
    else fn++
  }
  const accuracy = (tp + tn) / yte.length
  const recall = tp / (tp + fn || 1)
  const precision = tp / (tp + fp || 1)
  const f1 = (2 * precision * recall) / (precision + recall || 1)

  // ROC-AUC pelo método de ranking (Mann–Whitney)
  const order = probs.map((p, i) => ({ p, y: yte[i] })).sort((a, b) => a.p - b.p)
  let rankSum = 0
  for (let i = 0; i < order.length; i++) if (order[i].y === 1) rankSum += i + 1
  const nPos = yte.filter((v) => v === 1).length
  const nNeg = yte.length - nPos
  const auc = (rankSum - (nPos * (nPos + 1)) / 2) / (nPos * nNeg)

  console.log('\n====================  RESULTADOS  ====================')
  console.log(`  Acuracia : ${(accuracy * 100).toFixed(1)}%`)
  console.log(`  ROC-AUC  : ${auc.toFixed(3)}`)
  console.log(`  Recall   : ${recall.toFixed(3)}`)
  console.log(`  Precisao : ${precision.toFixed(3)}`)
  console.log(`  F1-Score : ${f1.toFixed(3)}`)
  console.log(`  Matriz   : TP=${tp} TN=${tn} FP=${fp} FN=${fn}`)
  console.log('======================================================\n')

  // Exporta o modelo para uso em JavaScript (runtime)
  const out = {
    algorithm: 'random-forest',
    dataset: 'Kaggle Diabetes Prediction Dataset (Mohammed Mustafa)',
    treinado_em: new Date().toISOString().split('T')[0],
    features: FEATURES,
    medians,
    thresholds: { baixo: 0.3, alto: 0.6 },
    metrics: {
      accuracy: +accuracy.toFixed(4),
      auc: +auc.toFixed(4),
      recall: +recall.toFixed(4),
      precision: +precision.toFixed(4),
      f1: +f1.toFixed(4),
    },
    model: clf.toJSON(),
  }
  fs.writeFileSync(OUT, JSON.stringify(out))
  const sizeMb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2)
  console.log(`Modelo salvo em ${OUT} (${sizeMb} MB)`)
}

main()
