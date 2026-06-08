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
    const { name, cpf, sexo, birth_date, peso, altura } = await request.json()

    const patient = await prisma.patient.create({
      data: {
        name,
        cpf: String(cpf || '').replace(/\D/g, ''),
        sexo,
        birth_date: new Date(birth_date),
        user_id: Number(session.user.id),
      },
    })

    // Registra peso/altura como um exame inicial de antropometria (com IMC calculado)
    const pesoN   = Number(peso)
    const alturaN = Number(altura)
    if (pesoN > 0 && alturaN > 0) {
      const imc = Number((pesoN / Math.pow(alturaN / 100, 2)).toFixed(1))
      await prisma.examResult.create({
        data: {
          patient_id: patient.id,
          exam_date: new Date(),
          exam_category: 'antropometria',
          values: { peso: pesoN, altura: alturaN, imc },
          source_type: 'manual',
        },
      })
    }

    return Response.json(patient)
  } catch (e) {
    if (e.code === 'P2002') {
      return Response.json({ detail: 'Já existe um paciente com esse CPF.' }, { status: 400 })
    }
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
