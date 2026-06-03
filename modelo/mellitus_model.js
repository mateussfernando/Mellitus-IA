// Módulo de predição de risco de diabetes para Node.js
// Dependência: npm install onnxruntime-node
// O arquivo mellitus_modelo.onnx deve estar na mesma pasta

const ort  = require("onnxruntime-node");
const path = require("path");

const MODEL_PATH = path.join(__dirname, "mellitus_modelo.onnx");

let _session = null;

async function getSession() {
  if (!_session) {
    _session = await ort.InferenceSession.create(MODEL_PATH);
  }
  return _session;
}

function calcularCategoriaImc(imc) {
  if (imc <= 18.5) return 0;
  if (imc <= 24.9) return 1;
  if (imc <= 29.9) return 2;
  return 3;
}

/**
 * Prevê risco de diabetes Tipo 2.
 *
 * @param {object} dados
 * @param {number} dados.glicemia        - Obrigatório
 * @param {number} dados.pressao         - Obrigatório
 * @param {number} dados.imc             - Obrigatório
 * @param {number} dados.idade           - Obrigatório
 * @param {number} [dados.gestacoes=0]
 * @param {number} [dados.espessura_pele=20]
 * @param {number} [dados.insulina=79]
 * @param {number} [dados.historico_familiar=0.5]
 *
 * @returns {Promise<{ probabilidade: number, risco: "BAIXO"|"MODERADO"|"ALTO" }>}
 */
async function preverRiscoDiabetes(dados) {
  const {
    glicemia,
    pressao,
    imc,
    idade,
    gestacoes        = 0,
    espessura_pele   = 20,
    insulina         = 79,
    historico_familiar = 0.5,
  } = dados;

  // Feature engineering idêntico ao treinamento Python
  const glicemia_x_imc    = glicemia * imc;
  const idade_x_imc       = idade * imc;
  const glicemia_quadrado = glicemia ** 2;
  const categoria_imc     = calcularCategoriaImc(imc);

  const features = new Float32Array([
    gestacoes,
    glicemia,
    pressao,
    espessura_pele,
    insulina,
    imc,
    historico_familiar,
    idade,
    glicemia_x_imc,
    idade_x_imc,
    glicemia_quadrado,
    categoria_imc,
  ]);

  const session   = await getSession();
  const inputName = session.inputNames[0];
  const tensor    = new ort.Tensor("float32", features, [1, 12]);
  const results   = await session.run({ [inputName]: tensor });

  // outputs[1] = tensor de probabilidades [classe_0, classe_1]
  const probTensor  = results[session.outputNames[1]];
  const probabilidade = probTensor.data[1];

  let risco = "BAIXO";
  if (probabilidade > 0.7)      risco = "ALTO";
  else if (probabilidade > 0.4) risco = "MODERADO";

  return { probabilidade, risco };
}

module.exports = { preverRiscoDiabetes };
