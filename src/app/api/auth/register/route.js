import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/middleware'

export async function POST(request) {
  try {
    const { name, email, password, crm } = await request.json()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ detail: 'E-mail já está em uso.' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword(password), crm },
    })

    return Response.json({ message: 'Médico/Usuário cadastrado com sucesso', id: user.id })
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
}
