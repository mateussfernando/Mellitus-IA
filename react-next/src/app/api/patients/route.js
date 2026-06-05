import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async (_request, _context, session) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { is_active: true, user_id: Number(session.user.id) },
      orderBy: { created_at: 'desc' },
      include: {
        examResults: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    })
    return Response.json(patients)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})

export const POST = withAuth(async (request, _context, session) => {
  try {
    const { name, sexo, birth_date } = await request.json()

    const patient = await prisma.patient.create({
      data: { name, sexo, birth_date: new Date(birth_date), user_id: Number(session.user.id) },
    })
    return Response.json(patient)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
