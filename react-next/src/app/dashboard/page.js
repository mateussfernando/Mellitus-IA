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
      examResults: {
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  })

  const stats = {
    total:    patients.length,
    alto:     0,
    moderado: 0,
    baixo:    0,
  }

  return <PatientsClient patients={patients} stats={stats} />
}
