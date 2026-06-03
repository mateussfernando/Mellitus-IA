import bcrypt from 'bcryptjs'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed)
}

// dynamic import para evitar dependência circular com src/auth.js
export function withAuth(handler) {
  return async function (request, context) {
    const { auth } = await import('@/auth')
    const session  = await auth()

    if (!session?.user) {
      return Response.json({ detail: 'Não autorizado.' }, { status: 401 })
    }

    return handler(request, context, session)
  }
}
