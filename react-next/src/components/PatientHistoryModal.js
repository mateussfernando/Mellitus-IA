'use client'
import { useRouter } from 'next/navigation'
import { getCategory } from '@/lib/examCatalog'

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function PatientHistoryModal({ patient, onClose }) {
  const router = useRouter()
  const examResults = patient.examResults ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border mx-2 md:mx-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0 text-white font-bold text-sm">
              {patient.name[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-text">{patient.name}</h2>
              <p className="text-xs text-text-muted">
                {patient.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'} · {calcAge(patient.birth_date)} anos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-bg shrink-0">
          <button
            onClick={() => router.push(`/dashboard/pacientes/${patient.id}/exame`)}
            className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo exame
          </button>
          <button
            onClick={() => router.push(`/dashboard/pacientes/${patient.id}/insights`)}
            className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-600 hover:text-white text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.5l1.9 5.8a4 4 0 0 0 2.5 2.5L22.2 12l-5.8 1.9a4 4 0 0 0-2.5 2.5L12 22.2l-1.9-5.8a4 4 0 0 0-2.5-2.5L1.8 12l5.8-1.9a4 4 0 0 0 2.5-2.5L12 2.5z" /></svg>
            Análise
          </button>
        </div>

        {/* Lista de exames */}
        <div className="overflow-y-auto flex-1">
          {examResults.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <svg className="w-10 h-10 mx-auto mb-3 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
              </svg>
              <p className="text-sm">Nenhum exame registrado.</p>
              <button
                onClick={() => router.push(`/dashboard/pacientes/${patient.id}/exame`)}
                className="cursor-pointer mt-3 text-primary text-sm font-semibold hover:underline"
              >
                Adicionar primeiro exame
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {examResults.map((exam, idx) => {
                const entries = Object.entries(exam.values || {})
                return (
                  <div key={exam.id} className="px-6 py-4 hover:bg-bg/60 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted">#{examResults.length - idx}</span>
                        <span className="text-sm font-semibold text-text">
                          {getCategory(exam.exam_category)?.label || exam.exam_category}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {new Date(exam.exam_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {entries.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entries.map(([k, v]) => (
                          <span key={k} className="text-xs bg-bg rounded-lg px-2.5 py-1 text-text-secondary">
                            <span className="text-text-muted">{k.replace(/_/g, ' ')}:</span>{' '}
                            <span className="font-semibold text-text">{v}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
