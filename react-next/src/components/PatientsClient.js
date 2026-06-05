'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NewPatientModal from '@/components/NewPatientModal'
import EditPatientModal from '@/components/EditPatientModal'
import PatientHistoryModal from '@/components/PatientHistoryModal'
import { generateAlerts } from '@/lib/alerts'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-3 md:p-5 flex items-center gap-3 md:gap-4">
      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold text-text leading-none">{value}</p>
        <p className="text-[10px] md:text-xs text-text-secondary mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function PatientsClient({ patients, stats }) {
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [historyPatient, setHistoryPatient] = useState(null)
  const router = useRouter()

  function refresh() { router.refresh() }

  function openHistory(patient) {
    setHistoryPatient(patient)
  }

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text">Pacientes</h1>
          <p className="text-sm text-text-secondary mt-1">Acompanhamento clínico e análise por IA</p>
        </div>
        <button
          onClick={() => setShowNewPatient(true)}
          className="cursor-pointer flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark
                     text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Novo Paciente</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard label="Total de pacientes" value={stats.total} color="bg-primary/10"
          icon={<svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" /></svg>}
        />
        <StatCard label="Total de exames" value={stats.totalExames} color="bg-blue-100"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>}
        />
        <StatCard label="Exames este mês" value={stats.examesMes} color="bg-amber-100"
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>}
        />
        <StatCard label="Em acompanhamento" value={stats.comExames} color="bg-emerald-100"
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
        />
      </div>

      {/* Tabela */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-bg">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Paciente</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Sexo</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Exames</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Glicemia</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">IMC</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-text-muted">
                    <svg className="w-10 h-10 mx-auto mb-3 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
                    </svg>
                    Nenhum paciente cadastrado ainda.
                  </td>
                </tr>
              ) : patients.map(p => {
                const lastExam = p.examResults?.[0]
                const alerts = lastExam ? generateAlerts([lastExam], p.sexo) : []
                const hasCritical = alerts.some(a => a.level === 'critical')
                const hasWarning  = alerts.some(a => a.level === 'warning')
                return (
                  <tr key={p.id} className="hover:bg-bg/60 transition-colors">
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openHistory(p)}
                        className="cursor-pointer text-left hover:text-primary transition-colors"
                      >
                        <p className="font-medium text-text">{p.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(p.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.sexo === 'MASCULINO' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {p.sexo === 'MASCULINO' ? '♂ M' : '♀ F'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      <span className="font-semibold text-text">{p._count?.examResults ?? 0}</span>
                      <span className="text-text-muted text-xs ml-1">exame{p._count?.examResults !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {lastExam?.values?.glicemia != null ? <>{Number(lastExam.values.glicemia).toFixed(1)} <span className="text-text-muted text-xs">mg/dL</span></> : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {lastExam?.values?.imc != null ? <>{Number(lastExam.values.imc).toFixed(1)} <span className="text-text-muted text-xs">kg/m²</span></> : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {!lastExam ? (
                        <span className="text-text-muted text-xs">Sem exames</span>
                      ) : hasCritical ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">● Atenção</span>
                      ) : hasWarning ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">● Revisar</span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">● Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setEditingPatient(p)}
                        className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <NewPatientModal
        isOpen={showNewPatient}
        onClose={() => setShowNewPatient(false)}
        onSuccess={() => { setShowNewPatient(false); refresh() }}
      />

      {editingPatient && (
        <EditPatientModal
          key={editingPatient.id}
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={() => { setEditingPatient(null); refresh() }}
        />
      )}

      {historyPatient && (
        <PatientHistoryModal
          key={historyPatient.id}
          patient={historyPatient}
          onClose={() => setHistoryPatient(null)}
        />
      )}
    </div>
  )
}
