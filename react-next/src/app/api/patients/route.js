import prisma from '@/lib/prisma'
import { preverRiscoDiabetes } from '@/lib/modelLoader'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async () => {
  try {
    const patients = await prisma.patient.findMany({ where: { is_active: true } })
    return Response.json(patients)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})

export const POST = withAuth(async (request) => {
  try {
    const {
      name, cpf, birth_date,
      glicemia, pressao, imc, idade,
      gestacoes, espessura_pele, insulina, historico_familiar,
    } = await request.json()

    const { probabilidade, risco } = await preverRiscoDiabetes({
      glicemia, pressao, imc, idade,
      gestacoes, espessura_pele, insulina, historico_familiar,
    })

    const patient = await prisma.patient.create({
      data: {
        name,
        cpf,
        birth_date:             new Date(birth_date),
        glicemia,
        pressao,
        imc,
        idade,
        gestacoes:              gestacoes          ?? null,
        espessura_pele:         espessura_pele     ?? null,
        insulina:               insulina           ?? null,
        historico_familiar:     historico_familiar ?? null,
        predicao_probabilidade: probabilidade,
        predicao_risco:         risco,
        predicao_data:          new Date(),
      },
    })

    // Coleta anônima para re-treino — sem nenhum dado identificador do paciente
    await prisma.trainingData.create({
      data: {
        glicemia,
        pressao,
        imc,
        idade,
        gestacoes:              gestacoes          ?? null,
        espessura_pele:         espessura_pele     ?? null,
        insulina:               insulina           ?? null,
        historico_familiar:     historico_familiar ?? null,
        predicao_probabilidade: probabilidade,
        predicao_risco:         risco,
      },
    })

    return Response.json(patient)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
