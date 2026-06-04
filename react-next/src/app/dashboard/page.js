import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import PatientsClient from '@/components/PatientsClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const patients = await prisma.patient.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
    include: {
      consultations: {
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  })

  const lastConsultations = patients.map(p => p.consultations[0]).filter(Boolean)

  const stats = {
    total:    patients.length,
    alto:     lastConsultations.filter(c => c.predicao_risco === 'ALTO').length,
    moderado: lastConsultations.filter(c => c.predicao_risco === 'MODERADO').length,
    baixo:    lastConsultations.filter(c => c.predicao_risco === 'BAIXO').length,
  }

  return <PatientsClient patients={patients} stats={stats} />
}
