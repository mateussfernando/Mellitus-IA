import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import PatientInsightsClient from '@/components/PatientInsightsClient'

export default async function InsightsPage({ params }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const patient = await prisma.patient.findUnique({
    where: { id: Number(id) },
    include: { examResults: { orderBy: { exam_date: 'desc' } } },
  })
  if (!patient || !patient.is_active) notFound()

  return (
    <PatientInsightsClient
      patient={{
        id: patient.id,
        name: patient.name,
        sexo: patient.sexo,
        birth_date: patient.birth_date.toISOString(),
        examResults: patient.examResults.map(e => ({
          id: e.id,
          exam_category: e.exam_category,
          exam_date: e.exam_date.toISOString(),
          values: e.values,
        })),
      }}
    />
  )
}
