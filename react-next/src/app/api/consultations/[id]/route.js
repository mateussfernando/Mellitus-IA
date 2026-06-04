import prisma from '@/lib/prisma'
import { preverRiscoDiabetes } from '@/lib/modelLoader'
import { withAuth } from '@/lib/middleware'

const CLINICAL = ['glicemia', 'pressao', 'imc', 'idade', 'espessura_pele', 'insulina', 'historico_familiar', 'gestacoes']

export const PUT = withAuth(async (request, context) => {
  try {
    const { id }   = await context.params
    const body     = await request.json()

    const consultation = await prisma.consultation.findUnique({
      where: { id: Number(id) },
      include: { patient: true },
    })
    if (!consultation) {
      return Response.json({ detail: 'Consulta não encontrada.' }, { status: 404 })
    }

    const data = {}
    for (const f of CLINICAL) {
      if (body[f] !== undefined) data[f] = body[f] === '' ? null : Number(body[f])
    }

    // Força gestacoes=null para masculino
    if (consultation.patient.sexo === 'MASCULINO') data.gestacoes = null

    const clinicalChanged = CLINICAL.some(
      f => body[f] !== undefined && Number(body[f]) !== consultation[f]
    )

    if (clinicalChanged) {
      const input = {
        glicemia:           data.glicemia           ?? consultation.glicemia,
        pressao:            data.pressao            ?? consultation.pressao,
        imc:                data.imc                ?? consultation.imc,
        idade:              data.idade              ?? consultation.idade,
        sexo:               consultation.patient.sexo,
        espessura_pele:     data.espessura_pele     ?? consultation.espessura_pele,
        insulina:           data.insulina           ?? consultation.insulina,
        historico_familiar: data.historico_familiar ?? consultation.historico_familiar,
      }
      const { probabilidade, risco } = await preverRiscoDiabetes(input)
      data.predicao_probabilidade = probabilidade
      data.predicao_risco         = risco
      data.predicao_data          = new Date()
    }

    const updated = await prisma.consultation.update({ where: { id: Number(id) }, data })
    return Response.json(updated)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})

export const DELETE = withAuth(async (_request, context) => {
  try {
    const { id } = await context.params
    await prisma.consultation.delete({ where: { id: Number(id) } })
    return Response.json({ message: 'Consulta removida.' })
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
