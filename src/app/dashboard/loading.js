export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-border" />
          <div className="h-4 w-56 rounded bg-border/70" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-border" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-4 md:p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-border shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-12 rounded bg-border" />
              <div className="h-3 w-20 rounded bg-border/70" />
            </div>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div className="h-10 w-full max-w-sm rounded-xl bg-border mb-5" />

      {/* Tabela */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="h-12 bg-bg border-b border-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
            <div className="w-10 h-10 rounded-full bg-border shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-border" />
              <div className="h-3 w-24 rounded bg-border/70" />
            </div>
            <div className="h-6 w-16 rounded-full bg-border/70 hidden sm:block" />
            <div className="h-8 w-44 rounded-lg bg-border/70 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
