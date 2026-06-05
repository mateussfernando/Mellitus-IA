import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ExamEntryClient from '@/components/ExamEntryClient'

export default async function NovoExamePage({ params }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const patient = await prisma.patient.findUnique({ where: { id: Number(id) } })
  if (!patient || !patient.is_active) notFound()

  return (
    <ExamEntryClient
      patient={{
        id: patient.id,
        name: patient.name,
        sexo: patient.sexo,
        birth_date: patient.birth_date.toISOString(),
      }}
    />
  )
}
