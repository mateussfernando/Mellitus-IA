import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params
    const patient = await prisma.patient.findFirst({
      where: { id: Number(id), user_id: Number(session.user.id) },
      include: {
        examResults: { orderBy: { created_at: 'desc' } },
      },
    })
    if (!patient || !patient.is_active) {
      return Response.json({ detail: 'Paciente não encontrado.' }, { status: 404 })
    }
    return Response.json(patient)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})

export const PUT = withAuth(async (request, context, session) => {
  try {
    const { id }                  = await context.params
    const { name, sexo, is_active } = await request.json()

    const patient = await prisma.patient.findFirst({
      where: { id: Number(id), user_id: Number(session.user.id) },
    })
    if (!patient) {
      return Response.json({ detail: 'Paciente não encontrado.' }, { status: 404 })
    }

    const data = {}
    if (name      !== undefined) data.name      = name
    if (sexo      !== undefined) data.sexo      = sexo
    if (is_active !== undefined) data.is_active = is_active

    const updated = await prisma.patient.update({ where: { id: Number(id) }, data })
    return Response.json(updated)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
