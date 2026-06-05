import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async (_request, context) => {
  try {
    const { id } = await context.params
    const exams = await prisma.examResult.findMany({
      where: { patient_id: Number(id) },
      orderBy: { exam_date: 'desc' },
    })
    return Response.json(exams)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})

export const POST = withAuth(async (request, context) => {
  try {
    const { id } = await context.params
    const patient = await prisma.patient.findUnique({ where: { id: Number(id) } })
    if (!patient || !patient.is_active) {
      return Response.json({ detail: 'Paciente não encontrado.' }, { status: 404 })
    }

    const { exam_date, exam_category, values, source_lab, source_type, raw_ocr_text } = await request.json()

    const exam = await prisma.examResult.create({
      data: {
        patient_id: Number(id),
        exam_date: new Date(exam_date),
        exam_category,
        values,
        source_lab: source_lab || 'manual',
        source_type: source_type || 'manual',
        raw_ocr_text,
      },
    })

    return Response.json(exam)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
