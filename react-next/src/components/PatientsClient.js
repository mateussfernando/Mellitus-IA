'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RiskBadge from '@/components/RiskBadge'
import NewPatientModal from '@/components/NewPatientModal'
import EditPatientModal from '@/components/EditPatientModal'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text leading-none">{value}</p>
        <p className="text-xs text-text-secondary mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function PatientsClient({ patients, stats }) {
  const [showModal,      setShowModal]      = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const router = useRouter()

  function handleSuccess() {
    setShowModal(false)
    router.refresh()
  }

  function handleEditSuccess() {
    setEditingPatient(null)
    router.refresh()
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Pacientes</h1>
          <p className="text-sm text-text-secondary mt-1">Gerenciamento e predição de risco</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark
                     text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Paciente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total de pacientes"
          value={stats.total}
          color="bg-primary/10"
          icon={<svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" /></svg>}
        />
        <StatCard
          label="Risco alto"
          value={stats.alto}
          color="bg-red-100"
          icon={<svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
        />
        <StatCard
          label="Risco moderado"
          value={stats.moderado}
          color="bg-amber-100"
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>}
        />
        <StatCard
          label="Risco baixo"
          value={stats.baixo}
          color="bg-emerald-100"
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
        />
      </div>

      {/* Tabela */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Paciente</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Glicemia</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Pressão</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">IMC</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Probabilidade</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Risco</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-text-muted">
                  <svg className="w-10 h-10 mx-auto mb-3 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
                  </svg>
                  Nenhum paciente cadastrado ainda.
                </td>
              </tr>
            ) : patients.map(p => (
              <tr key={p.id} className="hover:bg-bg/60 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-text">{p.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{p.cpf}</p>
                </td>
                <td className="px-5 py-4 text-text-secondary">{p.glicemia?.toFixed(1)} <span className="text-text-muted text-xs">mg/dL</span></td>
                <td className="px-5 py-4 text-text-secondary">{p.pressao?.toFixed(1)} <span className="text-text-muted text-xs">mmHg</span></td>
                <td className="px-5 py-4 text-text-secondary">{p.imc?.toFixed(1)} <span className="text-text-muted text-xs">kg/m²</span></td>
                <td className="px-5 py-4 text-text-secondary font-mono">
                  {p.predicao_probabilidade != null
                    ? `${(p.predicao_probabilidade * 100).toFixed(1)}%`
                    : '—'}
                </td>
                <td className="px-5 py-4">
                  <RiskBadge risco={p.predicao_risco} />
                </td>
                <td className="px-5 py-4 text-text-muted text-xs">
                  {p.predicao_data
                    ? new Date(p.predicao_data).toLocaleDateString('pt-BR')
                    : '—'}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => setEditingPatient(p)}
                    className="cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white transition-colors"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewPatientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />

      {editingPatient && (
        <EditPatientModal
          key={editingPatient.id}
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
