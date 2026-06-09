import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import PatientDetailClient from '@/components/PatientDetailClient'
import { preverRisco } from '@/lib/riskModel'

export default async function PatientDetailPage({ params }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const patient = await prisma.patient.findFirst({
    where: { id: Number(id), user_id: Number(session.user.id) },
    include: { examResults: { orderBy: { exam_date: 'desc' } } },
  })
  if (!patient || !patient.is_active) notFound()

  const risco = preverRisco(patient, patient.examResults)

  return (
    <PatientDetailClient
      risco={risco}
      patient={{
        id: patient.id,
        cpf: patient.cpf,
        name: patient.name,
        sexo: patient.sexo,
        birth_date: patient.birth_date.toISOString(),
        examResults: patient.examResults.map(e => ({
          id: e.id,
          exam_category: e.exam_category,
          exam_date: e.exam_date.toISOString(),
          source_type: e.source_type,
          source_lab: e.source_lab,
          values: e.values,
        })),
      }}
    />
  )
}
