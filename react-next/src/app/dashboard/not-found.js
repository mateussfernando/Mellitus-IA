import Link from 'next/link'

export default function DashboardNotFound() {
  return (
    <div className="min-h-full bg-white flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Página não encontrada</h1>
        <p className="text-sm text-slate-500 mb-6">
          O paciente ou recurso que você procura não existe ou não pertence à sua conta.
        </p>
        <Link href="/dashboard" className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Voltar ao painel
        </Link>
      </div>
    </div>
  )
}
