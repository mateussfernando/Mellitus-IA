'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import NewPatientModal from '@/components/NewPatientModal'
import EditPatientModal from '@/components/EditPatientModal'
import PatientHistoryModal from '@/components/PatientHistoryModal'
import { generateAlerts } from '@/lib/alerts'

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function statusOf(patient) {
  const lastExam = patient.examResults?.[0]
  if (!lastExam) return { label: 'Sem exames', dot: 'bg-slate-300', badge: 'bg-slate-100 text-slate-500' }
  const alerts = generateAlerts([lastExam], patient.sexo)
  if (alerts.some(a => a.level === 'critical')) return { label: 'Atenção', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' }
  if (alerts.some(a => a.level === 'warning')) return { label: 'Revisar', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' }
  return { label: 'Normal', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' }
}

function StatCard({ label, value, gradient, ring, icon }) {
  return (
    <div className="relative overflow-hidden bg-surface rounded-2xl border border-border p-4 md:p-5">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${gradient} blur-2xl opacity-60`} />
      <div className="relative flex items-center gap-3 md:gap-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${ring}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl md:text-3xl font-bold text-text leading-none tracking-tight">{value}</p>
          <p className="text-[11px] md:text-xs text-text-secondary mt-1.5">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function PatientsClient({ patients, stats }) {
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [historyPatient, setHistoryPatient] = useState(null)
  const [query, setQuery] = useState('')
  const router = useRouter()

  function refresh() { router.refresh() }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(p => p.name.toLowerCase().includes(q))
  }, [patients, query])

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard label="Total de pacientes" value={stats.total} gradient="bg-primary" ring="bg-primary/10"
          icon={<svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" /></svg>}
        />
        <StatCard label="Total de exames" value={stats.totalExames} gradient="bg-blue-500" ring="bg-blue-100"
          icon={<svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>}
        />
        <StatCard label="Exames este mês" value={stats.examesMes} gradient="bg-amber-500" ring="bg-amber-100"
          icon={<svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>}
        />
        <StatCard label="Em acompanhamento" value={stats.comExames} gradient="bg-emerald-500" ring="bg-emerald-100"
          icon={<svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
        />
      </div>

      {/* Busca */}
      <div className="mb-5">
        <div className="relative max-w-sm">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar paciente…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface text-text text-sm
                       focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border py-16 text-center text-text-muted">
          <svg className="w-12 h-12 mx-auto mb-3 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
          </svg>
          {query ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
          {!query && (
            <div>
              <button onClick={() => setShowNewPatient(true)} className="cursor-pointer mt-3 text-primary text-sm font-semibold hover:underline">
                Cadastrar primeiro paciente
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
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
                {filtered.map(p => {
                  const st = statusOf(p)
                  const lastExam = p.examResults?.[0]
                  return (
                    <tr key={p.id} className="hover:bg-bg/60 transition-colors">
                      <td className="px-5 py-4">
                        <button onClick={() => setHistoryPatient(p)} className="cursor-pointer text-left hover:text-primary transition-colors">
                          <p className="font-medium text-text">{p.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">{calcAge(p.birth_date)} anos · {new Date(p.birth_date).toLocaleDateString('pt-BR')}</p>
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
                        {lastExam?.values?.glicemia != null ? <>{Number(lastExam.values.glicemia).toFixed(0)} <span className="text-text-muted text-xs">mg/dL</span></> : <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {lastExam?.values?.imc != null ? <>{Number(lastExam.values.imc).toFixed(1)} <span className="text-text-muted text-xs">kg/m²</span></> : <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/pacientes/${p.id}/exame`)}
                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-dark transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Exame
                          </button>
                          <button
                            onClick={() => setEditingPatient(p)}
                            className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
