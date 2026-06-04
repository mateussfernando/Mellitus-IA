import prisma from '@/lib/prisma'
import { preverRiscoDiabetes } from '@/lib/modelLoader'
import { withAuth } from '@/lib/middleware'

export const POST = withAuth(async (request, context) => {
  try {
    const { id } = await context.params
    const patient = await prisma.patient.findUnique({ where: { id: Number(id) } })
    if (!patient || !patient.is_active) {
      return Response.json({ detail: 'Paciente não encontrado.' }, { status: 404 })
    }

    const {
      glicemia, pressao, imc, idade,
      espessura_pele, insulina, historico_familiar, gestacoes,
    } = await request.json()

    const { probabilidade, risco } = await preverRiscoDiabetes({
      glicemia, pressao, imc, idade,
      sexo: patient.sexo,
      espessura_pele, insulina, historico_familiar,
      gestacoes: patient.sexo === 'MASCULINO' ? 0 : (gestacoes ?? 0),
    })

    const consultation = await prisma.consultation.create({
      data: {
        patient_id:             Number(id),
        glicemia,
        pressao,
        imc,
        idade,
        espessura_pele:         espessura_pele     ?? null,
        insulina:               insulina           ?? null,
        historico_familiar:     historico_familiar ?? null,
        gestacoes:              patient.sexo === 'MASCULINO' ? null : (gestacoes ?? null),
        predicao_probabilidade: probabilidade,
        predicao_risco:         risco,
        predicao_data:          new Date(),
      },
    })

    // Coleta anônima para re-treino
    await prisma.trainingData.create({
      data: {
        sexo:               patient.sexo,
        glicemia,
        pressao,
        imc,
        idade,
        espessura_pele:     espessura_pele     ?? null,
        insulina:           insulina           ?? null,
        historico_familiar: historico_familiar ?? null,
        gestacoes:          patient.sexo === 'MASCULINO' ? null : (gestacoes ?? null),
        predicao_probabilidade: probabilidade,
        predicao_risco:         risco,
      },
    })

    return Response.json(consultation)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
