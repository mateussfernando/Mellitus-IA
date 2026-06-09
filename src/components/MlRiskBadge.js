// Badge do risco classificado pelo modelo de Machine Learning (Random Forest).
// Recebe o resultado de preverRisco() (calculado no servidor) como props.

const NIVEL = {
  BAIXO: { label: 'Risco baixo',    chip: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', ring: 'border-emerald-200' },
  MEDIO: { label: 'Risco moderado', chip: 'bg-amber-100 text-amber-700',     bar: 'bg-amber-500',   ring: 'border-amber-200' },
  ALTO:  { label: 'Risco alto',     chip: 'bg-red-100 text-red-700',         bar: 'bg-red-500',     ring: 'border-red-200' },
}

export default function MlRiskBadge({ disponivel, probabilidade, nivel, metrics }) {
  if (!disponivel) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-600">Risco (Machine Learning) indisponível</p>
          <p className="text-xs text-slate-400">Adicione um exame com glicemia ou HbA1c para classificar.</p>
        </div>
      </div>
    )
  }

  const cfg = NIVEL[nivel] || NIVEL.MEDIO
  const pct = Math.round(probabilidade * 100)

  return (
    <div className={`rounded-2xl border ${cfg.ring} bg-white p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Classificação do modelo de ML
        </span>
        <span className="text-[10px] font-medium text-slate-400">Random Forest</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle
              cx="18" cy="18" r="15.5" fill="none" strokeWidth="4" strokeLinecap="round"
              stroke="currentColor"
              className={nivel === 'ALTO' ? 'text-red-500' : nivel === 'MEDIO' ? 'text-amber-500' : 'text-emerald-500'}
              strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">{pct}%</span>
        </div>

        <div>
          <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${cfg.chip}`}>{cfg.label}</span>
          <p className="text-xs text-slate-500 mt-1.5">
            Probabilidade de diabetes tipo 2 estimada por aprendizado de máquina.
          </p>
        </div>
      </div>

      {metrics && (
        <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
          Modelo treinado com dados de ambos os sexos · AUC {metrics.auc} · acurácia {Math.round(metrics.accuracy * 100)}%
        </p>
      )}
    </div>
  )
}
