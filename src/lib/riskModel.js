// Inferência do modelo de Machine Learning (Random Forest treinado em JS).
// Classifica o risco de diabetes tipo 2 em BAIXO / MEDIO / ALTO a partir dos
// dados que o app coleta. O modelo é carregado de src/lib/risk_model.json
// (gerado por `npm run train`). Roda 100% em JavaScript — sem Python, sem ONNX.
import { RandomForestClassifier } from 'ml-random-forest'
import modelData from './risk_model.json'

let _clf = null
function getModel() {
  if (!_clf) _clf = RandomForestClassifier.load(modelData.model)
  return _clf
}

function calcAge(birthDate) {
  if (!birthDate) return null
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

// Valor mais recente (não-nulo) de um parâmetro entre os exames
function latest(exams, key) {
  const sorted = [...exams].sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date))
  for (const e of sorted) {
    const v = e?.values?.[key]
    if (v != null && v !== '' && !Number.isNaN(Number(v))) return Number(v)
  }
  return null
}

/**
 * Classifica o risco de diabetes do paciente.
 * @returns {{ disponivel: boolean, probabilidade?: number, nivel?: 'BAIXO'|'MEDIO'|'ALTO', metrics?: object }}
 */
export function preverRisco(patient, exams = []) {
  const m = modelData.medians

  const glicemia = latest(exams, 'glicemia')
  const hba1c = latest(exams, 'hba1c')

  // Sem nenhum indicador glicêmico não dá para avaliar risco de diabetes
  if (glicemia == null && hba1c == null) {
    return { disponivel: false }
  }

  const imc = latest(exams, 'imc') ?? m.imc
  const idade = calcAge(patient?.birth_date) ?? m.idade
  const sexo = patient?.sexo === 'MASCULINO' ? 1 : 0
  const ps = latest(exams, 'pressao_sistolica')
  const hipertensao = ps != null ? (ps >= 140 ? 1 : 0) : m.hipertensao

  // Ordem precisa casar com modelData.features:
  // ['glicemia','hba1c','imc','idade','sexo','hipertensao']
  const features = [
    glicemia ?? m.glicemia,
    hba1c ?? m.hba1c,
    imc,
    idade,
    sexo,
    hipertensao,
  ]

  const probabilidade = getModel().predictProbability([features], 1)[0]
  const { baixo, alto } = modelData.thresholds
  const nivel = probabilidade < baixo ? 'BAIXO' : probabilidade <= alto ? 'MEDIO' : 'ALTO'

  return {
    disponivel: true,
    probabilidade,
    nivel,
    metrics: modelData.metrics,
    dataset: modelData.dataset,
  }
}
