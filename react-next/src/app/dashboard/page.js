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
      examResults: { orderBy: { created_at: 'desc' }, take: 1 },
      _count: { select: { examResults: true } },
    },
  })

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const [totalExames, examesMes] = await Promise.all([
    prisma.examResult.count(),
    prisma.examResult.count({ where: { created_at: { gte: inicioMes } } }),
  ])

  const stats = {
    total:       patients.length,
    totalExames,
    examesMes,
    comExames:   patients.filter(p => p._count.examResults > 0).length,
  }

  return <PatientsClient patients={patients} stats={stats} />
}
