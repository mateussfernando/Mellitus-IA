import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

async function ownedExam(id, session) {
  return prisma.examResult.findFirst({
    where: { id: Number(id), patient: { user_id: Number(session.user.id) } },
  })
}

export const PUT = withAuth(async (request, context, session) => {
  try {
    const { id } = await context.params
    const exam = await ownedExam(id, session)
    if (!exam) {
      return Response.json({ detail: 'Exame não encontrado.' }, { status: 404 })
    }

    const { values, exam_date } = await request.json()

    const data = {}
    if (values !== undefined)    data.values    = values
    if (exam_date !== undefined) data.exam_date = new Date(exam_date)

    const updated = await prisma.examResult.update({
      where: { id: Number(id) },
      data,
    })
    return Response.json(updated)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})

export const DELETE = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params
    const exam = await ownedExam(id, session)
    if (!exam) {
      return Response.json({ detail: 'Exame não encontrado.' }, { status: 404 })
    }
    await prisma.examResult.delete({ where: { id: Number(id) } })
    return Response.json({ message: 'Exame removido.' })
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
