const ort  = require('onnxruntime-node');
const path = require('path');

const MODEL_PATH = path.join(__dirname, '../../../modelo/mellitus_modelo.onnx');

let _session = null;

async function getSession() {
  if (!_session) {
    _session = await ort.InferenceSession.create(MODEL_PATH);
    console.log('Modelo ONNX carregado com sucesso!');
  }
  return _session;
}

function calcularCategoriaImc(imc) {
  if (imc <= 18.5) return 0;
  if (imc <= 24.9) return 1;
  if (imc <= 29.9) return 2;
  return 3;
}

async function preverRiscoDiabetes(dados) {
  const {
    glicemia,
    pressao,
    imc,
    idade,
    gestacoes          = 0,
    espessura_pele     = 20,
    insulina           = 79,
    historico_familiar = 0.5,
  } = dados;

  const features = new Float32Array([
    gestacoes,
    glicemia,
    pressao,
    espessura_pele,
    insulina,
    imc,
    historico_familiar,
    idade,
    glicemia * imc,         // glicemia_x_imc
    idade * imc,            // idade_x_imc
    glicemia ** 2,          // glicemia_quadrado
    calcularCategoriaImc(imc),
  ]);

  const session   = await getSession();
  const inputName = session.inputNames[0];
  const tensor    = new ort.Tensor('float32', features, [1, 12]);
  const results   = await session.run({ [inputName]: tensor });

  const probabilidade = results[session.outputNames[1]].data[1];

  let risco = 'BAIXO';
  if (probabilidade > 0.7)      risco = 'ALTO';
  else if (probabilidade > 0.4) risco = 'MODERADO';

  return { probabilidade, risco };
}

module.exports = { preverRiscoDiabetes };
