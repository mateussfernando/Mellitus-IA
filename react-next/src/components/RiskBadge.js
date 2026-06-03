const styles = {
  ALTO:     'bg-red-100 text-red-700 border border-red-200',
  MODERADO: 'bg-amber-100 text-amber-700 border border-amber-200',
  BAIXO:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
}

export default function RiskBadge({ risco }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[risco] ?? styles.BAIXO}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${risco === 'ALTO' ? 'bg-red-500' : risco === 'MODERADO' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      {risco ?? '—'}
    </span>
  )
}
