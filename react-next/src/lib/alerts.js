export const THRESHOLDS = {
  glicemia: { normal_max: 99, pre_diabetes: 125, diabetes: 126 },
  hba1c: { normal_max: 5.6, pre_diabetes: 6.4, diabetes: 6.5 },
  ldl: { otimo: 100, desejavel: 130, alto: 160, muito_alto: 190 },
  colesterol_total: { otimo: 170, desejavel: 200, alto: 240 },
  triglicerideos: { normal: 150, limítrofe: 200, alto: 500 },
  hdl_h: { baixo: 40, normal: 60 },
  hdl_f: { baixo: 50, normal: 60 },
  creatinina_h: { max: 1.2 },
  creatinina_f: { max: 1.0 },
  tsh: { min: 0.4, max: 4.0 },
  hemoglobina_h: { min: 13.5, max: 17.5 },
  hemoglobina_f: { min: 12.0, max: 16.0 },
  pressao_sistolica: { normal: 120, elevada: 140 },
  pressao_diastolica: { normal: 80, elevada: 90 },
}

export function checkThreshold(param, value, sexo = 'FEMININO') {
  if (value == null) return null

  let threshold = THRESHOLDS[param]
  if (!threshold) return null

  // Parâmetros sexo-específicos
  if (param === 'creatinina' && sexo === 'MASCULINO') {
    threshold = THRESHOLDS.creatinina_h
  } else if (param === 'creatinina' && sexo === 'FEMININO') {
    threshold = THRESHOLDS.creatinina_f
  }
  if (param === 'hemoglobina' && sexo === 'MASCULINO') {
    threshold = THRESHOLDS.hemoglobina_h
  } else if (param === 'hemoglobina' && sexo === 'FEMININO') {
    threshold = THRESHOLDS.hemoglobina_f
  }
  if (param === 'hdl' && sexo === 'MASCULINO') {
    threshold = THRESHOLDS.hdl_h
  } else if (param === 'hdl' && sexo === 'FEMININO') {
    threshold = THRESHOLDS.hdl_f
  }

  // Verificar ranges
  if (threshold.min != null && value < threshold.min) return 'LOW'
  if (threshold.max != null && value > threshold.max) return 'HIGH'
  if (threshold.normal_max != null && value > threshold.normal_max) return 'HIGH'
  if (threshold.muito_alto != null && value > threshold.muito_alto) return 'CRITICAL'
  if (threshold.alto != null && value > threshold.alto) return 'HIGH'
  if (threshold.limítrofe != null && value > threshold.limítrofe) return 'BORDERLINE'
  if (threshold.normal != null && value > threshold.normal) return 'HIGH'

  return null
}

export function detectTrends(exams, param) {
  if (!exams || exams.length < 2) return null

  const values = exams
    .map(e => e.values?.[param])
    .filter(v => v != null)

  if (values.length < 2) return null

  const sorted = [...values].sort((a, b) => a - b)
  const firstThird = sorted.slice(0, Math.floor(sorted.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(sorted.length / 3)
  const lastThird = sorted.slice(-Math.ceil(sorted.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(sorted.length / 3)
  const increase = ((lastThird - firstThird) / firstThird) * 100

  if (increase > 20) return 'INCREASING'
  if (increase < -20) return 'DECREASING'
  return 'STABLE'
}

export function generateAlerts(exams, patientSexo = 'FEMININO') {
  const alerts = []
  if (!exams || exams.length === 0) return alerts

  const lastExam = exams[0]
  if (!lastExam?.values) return alerts

  // Glicemia
  if (lastExam.values.glicemia != null) {
    const status = checkThreshold('glicemia', lastExam.values.glicemia)
    if (status === 'CRITICAL') {
      alerts.push({ level: 'critical', message: 'Glicemia em nível crítico', param: 'glicemia' })
    } else if (status === 'HIGH') {
      alerts.push({ level: 'warning', message: 'Glicemia elevada', param: 'glicemia' })
    }
  }

  // HbA1c
  if (lastExam.values.hba1c != null) {
    const status = checkThreshold('hba1c', lastExam.values.hba1c)
    if (status === 'HIGH') {
      alerts.push({ level: 'warning', message: 'HbA1c acima do alvo', param: 'hba1c' })
    }
  }

  // LDL
  if (lastExam.values.ldl != null) {
    const status = checkThreshold('ldl', lastExam.values.ldl)
    if (status === 'HIGH') {
      alerts.push({ level: 'warning', message: 'LDL elevado', param: 'ldl' })
    }
  }

  // Pressão
  if (lastExam.values.pressao_sistolica != null) {
    const status = checkThreshold('pressao_sistolica', lastExam.values.pressao_sistolica)
    if (status === 'CRITICAL') {
      alerts.push({ level: 'critical', message: 'Pressão arterial crítica', param: 'pressao' })
    } else if (status === 'HIGH') {
      alerts.push({ level: 'warning', message: 'Pressão arterial elevada', param: 'pressao' })
    }
  }

  // Creatinina
  if (lastExam.values.creatinina != null) {
    const status = checkThreshold('creatinina', lastExam.values.creatinina, patientSexo)
    if (status === 'HIGH') {
      alerts.push({ level: 'warning', message: 'Creatinina elevada - avaliar função renal', param: 'creatinina' })
    }
  }

  // Hemoglobina
  if (lastExam.values.hemoglobina != null) {
    const status = checkThreshold('hemoglobina', lastExam.values.hemoglobina, patientSexo)
    if (status === 'LOW') {
      alerts.push({ level: 'warning', message: 'Anemia detectada - hemoglobina baixa', param: 'hemoglobina' })
    }
  }

  // Tendências
  const glicemiaTrend = detectTrends(exams, 'glicemia')
  if (glicemiaTrend === 'INCREASING') {
    alerts.push({ level: 'info', message: 'Glicemia em tendência crescente', param: 'glicemia', trend: true })
  }

  const imcTrend = detectTrends(exams, 'imc')
  if (imcTrend === 'INCREASING') {
    alerts.push({ level: 'info', message: 'IMC em tendência crescente', param: 'imc', trend: true })
  }

  return alerts
}
