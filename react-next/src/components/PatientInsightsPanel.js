'use client'
import { useState } from 'react'

const iconMap = {
  tendencia: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.343 19.657" />
    </svg>
  ),
  correlacao: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  alerta: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  sugestao: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
}

const colorMap = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-900' },
  aviso: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', text: 'text-amber-900' },
  critico: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-900' },
}

export default function PatientInsightsPanel({ patient }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateInsights() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/patients/${patient.id}/insights`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao gerar análise.')
      setInsights(data.insights || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-text-muted">
        <svg className="w-6 h-6 mx-auto mb-3 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Analisando histórico com IA…</p>
      </div>
    )
  }

  // Estado inicial — botão para gerar
  if (insights === null) {
    return (
      <div className="py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-text mb-1">Análise inteligente do histórico</h3>
        <p className="text-xs text-text-muted max-w-sm mx-auto mb-5">
          A IA cruza todos os exames do paciente para identificar tendências, correlações e padrões clínicos.
        </p>
        <button
          onClick={generateInsights}
          className="cursor-pointer px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
        >
          Gerar análise com IA
        </button>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => {
        const colors = colorMap[insight.urgencia] || colorMap.info
        const icon = iconMap[insight.tipo]
        return (
          <div key={idx} className={`border ${colors.border} ${colors.bg} rounded-lg p-4 flex gap-3`}>
            <div className={`${colors.icon} shrink-0 mt-1`}>{icon}</div>
            <div className="text-left">
              <p className={`text-sm font-medium ${colors.text}`}>{insight.descricao}</p>
              <p className="text-xs text-text-muted mt-1 capitalize">{insight.tipo}</p>
            </div>
          </div>
        )
      })}

      <button
        onClick={generateInsights}
        className="cursor-pointer w-full mt-2 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-bg transition-colors"
      >
        Gerar novamente
      </button>

      <div className="flex items-center justify-center gap-1.5 pt-1">
        <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.5l1.9 5.8a4 4 0 0 0 2.5 2.5L22.2 12l-5.8 1.9a4 4 0 0 0-2.5 2.5L12 22.2l-1.9-5.8a4 4 0 0 0-2.5-2.5L1.8 12l5.8-1.9a4 4 0 0 0 2.5-2.5L12 2.5z" />
        </svg>
        <span className="text-[11px] text-text-muted font-medium">Análise gerada por Claude Sonnet 4.6</span>
      </div>
    </div>
  )
}
