import prisma from '@/lib/prisma'
import { preverRiscoDiabetes } from '@/lib/modelLoader'
import { withAuth } from '@/lib/middleware'

const CLINICAL = ['glicemia', 'pressao', 'imc', 'idade', 'gestacoes', 'espessura_pele', 'insulina', 'historico_familiar']

export const GET = withAuth(async (request, context) => {
  try {
    const { id }    = await context.params
    const patient   = await prisma.patient.findUnique({ where: { id: Number(id) } })

    if (!patient || !patient.is_active) {
      return Response.json({ detail: 'Paciente não encontrado.' }, { status: 404 })
    }
    return Response.json(patient)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})

export const PUT = withAuth(async (request, context) => {
  try {
    const { id } = await context.params
    const body   = await request.json()

    const patient = await prisma.patient.findUnique({ where: { id: Number(id) } })
    if (!patient) {
      return Response.json({ detail: 'Paciente não existe.' }, { status: 404 })
    }

    const data = {}

    if (body.name       !== undefined) data.name       = body.name
    if (body.is_active  !== undefined) data.is_active  = body.is_active
    if (body.birth_date !== undefined) data.birth_date = new Date(body.birth_date)

    for (const f of CLINICAL) {
      if (body[f] !== undefined) data[f] = body[f] === '' ? null : Number(body[f])
    }

    // re-roda a IA se algum dado clínico foi alterado
    const clinicalChanged = CLINICAL.some(f => body[f] !== undefined && Number(body[f]) !== patient[f])
    if (clinicalChanged) {
      const input = {
        glicemia:           data.glicemia           ?? patient.glicemia,
        pressao:            data.pressao            ?? patient.pressao,
        imc:                data.imc                ?? patient.imc,
        idade:              data.idade              ?? patient.idade,
        gestacoes:          data.gestacoes          ?? patient.gestacoes,
        espessura_pele:     data.espessura_pele     ?? patient.espessura_pele,
        insulina:           data.insulina           ?? patient.insulina,
        historico_familiar: data.historico_familiar ?? patient.historico_familiar,
      }
      const { probabilidade, risco } = await preverRiscoDiabetes(input)
      data.predicao_probabilidade = probabilidade
      data.predicao_risco         = risco
      data.predicao_data          = new Date()
    }

    const updated = await prisma.patient.update({ where: { id: Number(id) }, data })
    return Response.json(updated)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
