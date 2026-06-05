// Seed de demonstração: pacientes com históricos de exames variados.
// Rode com:  npx prisma db seed
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DAY = 24 * 60 * 60 * 1000

function birthFromAge(age) {
  return new Date(Date.now() - Math.round(age * 365.25) * DAY)
}

// Cada paciente: dados + lista de exames (daysAgo controla a ordem temporal)
const PACIENTES = [
  {
    name: 'Ana Beatriz Costa', sexo: 'FEMININO', age: 58,
    exams: [
      { daysAgo: 180, category: 'glicemia', source: 'manual', values: { glicemia: 96, hba1c: 5.7, imc: 28.5, idade: 58 } },
      { daysAgo: 90,  category: 'glicemia', source: 'manual', values: { glicemia: 110, hba1c: 6.0, imc: 29.1, idade: 58 } },
      { daysAgo: 10,  category: 'glicemia', source: 'pdf', lab: 'Fleury', values: { glicemia: 123, hba1c: 6.3, imc: 29.4, idade: 58 } },
    ],
  },
  {
    name: 'Carlos Henrique Lima', sexo: 'MASCULINO', age: 63,
    exams: [
      { daysAgo: 120, category: 'antropometria', source: 'manual', values: { imc: 33.2, pressao_sistolica: 150, pressao_diastolica: 96, circunferencia_abdominal: 109, idade: 63 } },
      { daysAgo: 60,  category: 'lipidios', source: 'pdf', lab: 'DASA', values: { colesterol_total: 281, ldl: 196, hdl: 31, triglicerideos: 342 } },
      { daysAgo: 5,   category: 'glicemia', source: 'pdf', lab: 'DASA', values: { glicemia: 192, hba1c: 8.1, imc: 33.8, idade: 63 } },
    ],
  },
  {
    name: 'Mariana Souza', sexo: 'FEMININO', age: 46,
    exams: [
      { daysAgo: 40, category: 'tireoide', source: 'pdf', lab: 'Hermes Pardini', values: { tsh: 8.9, t4_livre: 0.7, anti_tpo: 124 } },
      { daysAgo: 15, category: 'lipidios', source: 'manual', values: { colesterol_total: 262, ldl: 179, hdl: 49, triglicerideos: 185, imc: 26.4 } },
    ],
  },
  {
    name: 'João Pedro Alves', sexo: 'MASCULINO', age: 31,
    exams: [
      { daysAgo: 200, category: 'lipidios', source: 'manual', values: { colesterol_total: 168, ldl: 92, hdl: 58, triglicerideos: 90 } },
      { daysAgo: 20,  category: 'glicemia', source: 'manual', values: { glicemia: 86, hba1c: 5.2, imc: 23.1, idade: 31 } },
    ],
  },
  {
    name: 'Helena Rodrigues', sexo: 'FEMININO', age: 71,
    exams: [
      { daysAgo: 60, category: 'hemograma', source: 'pdf', lab: 'Fleury', values: { hemoglobina: 10.4, hematocrito: 32.1, vcm: 78, leucocitos: 6800, plaquetas: 240000 } },
      { daysAgo: 12, category: 'funcao_renal', source: 'pdf', lab: 'Fleury', values: { creatinina: 1.45, ureia: 62, tfg: 46, acido_urico: 6.2 } },
    ],
  },
  {
    name: 'Roberto Carvalho', sexo: 'MASCULINO', age: 55,
    exams: [
      { daysAgo: 150, category: 'glicemia', source: 'manual', values: { glicemia: 108, hba1c: 6.1, imc: 27.8, idade: 55 } },
      { daysAgo: 14,  category: 'glicemia', source: 'manual', values: { glicemia: 94, hba1c: 5.6, imc: 26.9, idade: 55 } },
    ],
  },
  {
    name: 'Fernanda Oliveira', sexo: 'FEMININO', age: 39,
    exams: [
      { daysAgo: 30, category: 'vitaminas', source: 'pdf', lab: 'DASA', values: { vitamina_d: 18, vitamina_b12: 312, ferro: 85, acido_folico: 7.1 } },
      { daysAgo: 8,  category: 'antropometria', source: 'manual', values: { imc: 24.2, pressao_sistolica: 116, pressao_diastolica: 76, idade: 39 } },
    ],
  },
  {
    name: 'Paulo Mendes', sexo: 'MASCULINO', age: 67,
    exams: [
      { daysAgo: 180, category: 'glicemia', source: 'manual', values: { glicemia: 118, hba1c: 6.2, imc: 30.1, idade: 67 } },
      { daysAgo: 120, category: 'lipidios', source: 'pdf', lab: 'Fleury', values: { colesterol_total: 240, ldl: 165, hdl: 38, triglicerideos: 210 } },
      { daysAgo: 60,  category: 'funcao_renal', source: 'pdf', lab: 'Fleury', values: { creatinina: 1.25, ureia: 48, tfg: 62 } },
      { daysAgo: 7,   category: 'glicemia', source: 'pdf', lab: 'Fleury', values: { glicemia: 142, hba1c: 6.8, imc: 30.6, idade: 67 } },
    ],
  },
  {
    name: 'Lucas Martins', sexo: 'MASCULINO', age: 49,
    exams: [
      { daysAgo: 18, category: 'glicemia', source: 'manual', values: { glicemia: 92, hba1c: 5.4, imc: 25.8, idade: 49 } },
    ],
  },
]

async function main() {
  console.log('Limpando pacientes e exames existentes…')
  await prisma.examResult.deleteMany({})
  await prisma.patient.deleteMany({})

  let totalExames = 0
  for (const p of PACIENTES) {
    const patient = await prisma.patient.create({
      data: { name: p.name, sexo: p.sexo, birth_date: birthFromAge(p.age) },
    })

    for (const ex of p.exams) {
      const when = new Date(Date.now() - ex.daysAgo * DAY)
      await prisma.examResult.create({
        data: {
          patient_id: patient.id,
          exam_date: when,
          created_at: when,
          exam_category: ex.category,
          values: ex.values,
          source_type: ex.source || 'manual',
          source_lab: ex.lab || null,
        },
      })
      totalExames++
    }
    console.log(`  ✔ ${p.name} — ${p.exams.length} exame(s)`)
  }

  console.log(`\nSeed concluído: ${PACIENTES.length} pacientes, ${totalExames} exames.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
