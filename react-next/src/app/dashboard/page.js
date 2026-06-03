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
  })

  const stats = {
    total:    patients.length,
    alto:     patients.filter(p => p.predicao_risco === 'ALTO').length,
    moderado: patients.filter(p => p.predicao_risco === 'MODERADO').length,
    baixo:    patients.filter(p => p.predicao_risco === 'BAIXO').length,
  }

  return <PatientsClient patients={patients} stats={stats} />
}
