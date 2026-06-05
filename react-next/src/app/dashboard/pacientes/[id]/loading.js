export default function PatientPageLoading() {
  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-slate-200 px-5 md:px-8 py-4">
        <div className="max-w-3xl mx-auto h-5 w-40 rounded bg-slate-100 animate-pulse" />
      </div>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-8 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-slate-100" />
            <div className="h-4 w-32 rounded bg-slate-100" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg className="w-6 h-6 animate-spin mb-3 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Carregando…</p>
        </div>
      </div>
    </div>
  )
}
