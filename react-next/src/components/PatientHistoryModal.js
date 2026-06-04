'use client'
import RiskBadge from '@/components/RiskBadge'

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function PatientHistoryModal({ patient, onClose, onNewConsultation }) {
  const consultations = patient.consultations ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border mx-2 md:mx-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">{patient.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-text">{patient.name}</h2>
              <p className="text-xs text-text-muted">
                {patient.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'} · {calcAge(patient.birth_date)} anos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewConsultation}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova Consulta
            </button>
            <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Evolução visual */}
        {consultations.length > 1 && (
          <div className="px-6 py-4 border-b border-border bg-bg shrink-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Evolução do risco</p>
            <div className="flex items-end gap-1.5 h-12">
              {[...consultations].reverse().map((c, i) => {
                const pct = (c.predicao_probabilidade ?? 0) * 100
                const color = c.predicao_risco === 'ALTO' ? 'bg-red-400' : c.predicao_risco === 'MODERADO' ? 'bg-amber-400' : 'bg-emerald-400'
                return (
                  <div key={c.id} className="flex-1 flex flex-col items-center gap-1" title={`${pct.toFixed(1)}%`}>
                    <div className={`w-full rounded-t ${color}`} style={{ height: `${Math.max(pct, 4)}%` }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-muted">{new Date([...consultations].reverse()[0]?.created_at).toLocaleDateString('pt-BR')}</span>
              <span className="text-[10px] text-text-muted">{new Date(consultations[0]?.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        )}

        {/* Lista de consultas */}
        <div className="overflow-y-auto flex-1">
          {consultations.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <svg className="w-10 h-10 mx-auto mb-3 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
              </svg>
              <p className="text-sm">Nenhuma consulta registrada.</p>
              <button onClick={onNewConsultation} className="cursor-pointer mt-3 text-primary text-sm font-semibold hover:underline">
                Adicionar primeira consulta
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {consultations.map((c, idx) => (
                <div key={c.id} className="px-6 py-4 hover:bg-bg/60 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-muted">#{consultations.length - idx}</span>
                      <span className="text-sm font-semibold text-text">
                        {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text">
                        {c.predicao_probabilidade != null ? `${(c.predicao_probabilidade * 100).toFixed(1)}%` : '—'}
                      </span>
                      <RiskBadge risco={c.predicao_risco} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: 'Glicemia', value: c.glicemia, unit: 'mg/dL' },
                      { label: 'Pressão',  value: c.pressao,  unit: 'mmHg' },
                      { label: 'IMC',      value: c.imc,      unit: 'kg/m²' },
                      { label: 'Idade',    value: c.idade,    unit: 'anos' },
                    ].map(f => (
                      <div key={f.label} className="bg-bg rounded-lg px-3 py-2">
                        <p className="text-[10px] text-text-muted uppercase tracking-wide">{f.label}</p>
                        <p className="text-sm font-semibold text-text">
                          {f.value?.toFixed(1)} <span className="text-xs font-normal text-text-muted">{f.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
