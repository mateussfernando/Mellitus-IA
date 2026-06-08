// Catálogo de categorias de exames e seus parâmetros para entrada manual.
// key = chave salva em ExamResult.values; usada também por alerts.js e pela IA.

export const EXAM_CATALOG = [
  {
    key: 'antropometria',
    label: 'Sinais & Antropometria',
    params: [
      { key: 'peso',                    label: 'Peso',                   unit: 'kg' },
      { key: 'altura',                  label: 'Altura',                 unit: 'cm' },
      { key: 'imc',                     label: 'IMC',                    unit: 'kg/m²' },
      { key: 'pressao_sistolica',       label: 'Pressão sistólica',      unit: 'mmHg' },
      { key: 'pressao_diastolica',      label: 'Pressão diastólica',     unit: 'mmHg' },
      { key: 'circunferencia_abdominal',label: 'Circ. abdominal',        unit: 'cm' },
      { key: 'idade',                   label: 'Idade',                  unit: 'anos' },
    ],
  },
  {
    key: 'glicemia',
    label: 'Glicemia & Metabolismo',
    params: [
      { key: 'glicemia', label: 'Glicemia em jejum', unit: 'mg/dL' },
      { key: 'hba1c',    label: 'Hemoglobina glicada (HbA1c)', unit: '%' },
      { key: 'insulina', label: 'Insulina',          unit: 'µU/mL' },
      { key: 'homa_ir',  label: 'HOMA-IR',           unit: '' },
    ],
  },
  {
    key: 'lipidios',
    label: 'Lipidograma',
    params: [
      { key: 'colesterol_total', label: 'Colesterol total', unit: 'mg/dL' },
      { key: 'ldl',              label: 'LDL',              unit: 'mg/dL' },
      { key: 'hdl',              label: 'HDL',              unit: 'mg/dL' },
      { key: 'triglicerideos',   label: 'Triglicerídeos',   unit: 'mg/dL' },
    ],
  },
  {
    key: 'hemograma',
    label: 'Hemograma',
    params: [
      { key: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL' },
      { key: 'hematocrito', label: 'Hematócrito', unit: '%' },
      { key: 'leucocitos',  label: 'Leucócitos',  unit: '/mm³' },
      { key: 'plaquetas',   label: 'Plaquetas',   unit: '/mm³' },
      { key: 'vcm',         label: 'VCM',         unit: 'fL' },
    ],
  },
  {
    key: 'funcao_renal',
    label: 'Função Renal',
    params: [
      { key: 'creatinina', label: 'Creatinina',  unit: 'mg/dL' },
      { key: 'ureia',      label: 'Ureia',       unit: 'mg/dL' },
      { key: 'tfg',        label: 'TFG',         unit: 'mL/min' },
      { key: 'acido_urico',label: 'Ácido úrico', unit: 'mg/dL' },
    ],
  },
  {
    key: 'funcao_hepatica',
    label: 'Função Hepática',
    params: [
      { key: 'tgo_ast',           label: 'TGO / AST',          unit: 'U/L' },
      { key: 'tgp_alt',           label: 'TGP / ALT',          unit: 'U/L' },
      { key: 'ggt',               label: 'GGT',                unit: 'U/L' },
      { key: 'bilirrubina_total', label: 'Bilirrubina total',  unit: 'mg/dL' },
      { key: 'albumina',          label: 'Albumina',           unit: 'g/dL' },
    ],
  },
  {
    key: 'tireoide',
    label: 'Tireoide',
    params: [
      { key: 'tsh',      label: 'TSH',       unit: 'mUI/L' },
      { key: 't4_livre', label: 'T4 livre',  unit: 'ng/dL' },
      { key: 't3_livre', label: 'T3 livre',  unit: 'pg/mL' },
      { key: 'anti_tpo', label: 'Anti-TPO',  unit: 'UI/mL' },
    ],
  },
  {
    key: 'inflamacao',
    label: 'Inflamação',
    params: [
      { key: 'pcr',       label: 'PCR',       unit: 'mg/L' },
      { key: 'vhs',       label: 'VHS',       unit: 'mm/h' },
      { key: 'ferritina', label: 'Ferritina', unit: 'ng/mL' },
    ],
  },
  {
    key: 'vitaminas',
    label: 'Vitaminas & Minerais',
    params: [
      { key: 'vitamina_d',   label: 'Vitamina D (25-OH)', unit: 'ng/mL' },
      { key: 'vitamina_b12', label: 'Vitamina B12',       unit: 'pg/mL' },
      { key: 'acido_folico', label: 'Ácido fólico',       unit: 'ng/mL' },
      { key: 'ferro',        label: 'Ferro sérico',       unit: 'µg/dL' },
    ],
  },
  {
    key: 'hormonios',
    label: 'Hormônios',
    params: [
      { key: 'testosterona', label: 'Testosterona', unit: 'ng/dL' },
      { key: 'cortisol',     label: 'Cortisol',     unit: 'µg/dL' },
      { key: 'prolactina',   label: 'Prolactina',   unit: 'ng/mL' },
      { key: 'fsh',          label: 'FSH',          unit: 'mUI/mL' },
      { key: 'lh',           label: 'LH',           unit: 'mUI/mL' },
    ],
  },
  {
    key: 'coagulacao',
    label: 'Coagulação',
    params: [
      { key: 'inr',       label: 'INR',       unit: '' },
      { key: 'ttpa',      label: 'TTPA',      unit: 's' },
      { key: 'd_dimero',  label: 'D-Dímero',  unit: 'ng/mL' },
    ],
  },
  {
    key: 'marcadores_cardiacos',
    label: 'Marcadores Cardíacos',
    params: [
      { key: 'troponina', label: 'Troponina', unit: 'ng/mL' },
      { key: 'ck_mb',     label: 'CK-MB',     unit: 'U/L' },
      { key: 'bnp',       label: 'BNP',       unit: 'pg/mL' },
    ],
  },
  {
    key: 'marcadores_tumorais',
    label: 'Marcadores Tumorais',
    params: [
      { key: 'psa',    label: 'PSA',    unit: 'ng/mL' },
      { key: 'cea',    label: 'CEA',    unit: 'ng/mL' },
      { key: 'ca_125', label: 'CA-125', unit: 'U/mL' },
      { key: 'afp',    label: 'AFP',    unit: 'ng/mL' },
    ],
  },
  {
    key: 'urina',
    label: 'Urinálise (EAS)',
    params: [
      { key: 'microalbuminuria', label: 'Microalbuminúria', unit: 'mg/g' },
      { key: 'densidade',        label: 'Densidade',        unit: '' },
      { key: 'ph',               label: 'pH',               unit: '' },
    ],
  },
]

export function getCategory(key) {
  return EXAM_CATALOG.find(c => c.key === key)
}

// Índice global de parâmetros: key -> { key, label, unit, category }
const PARAM_INDEX = {}
for (const c of EXAM_CATALOG) {
  for (const p of c.params) {
    PARAM_INDEX[p.key] = { ...p, category: c.key }
  }
}

export function getParam(key) {
  return PARAM_INDEX[key] || { key, label: key.replace(/_/g, ' '), unit: '' }
}
