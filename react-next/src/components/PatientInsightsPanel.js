'use client'
import { useState, useEffect } from 'react'

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

  async function generateInsights() {
    setLoading(true)
    try {
      const res = await fetch(`/api/patients/${patient.id}/insights`)
      const data = await res.json()
      setInsights(data.insights || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (patient.id) {
      generateInsights()
    }
  }, [patient.id])

  if (loading) {
    return (
      <div className="p-6 text-center text-text-muted">
        <svg className="w-5 h-5 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Gerando análise com IA…</p>
      </div>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="p-6 text-center text-text-muted">
        <p className="text-sm">Nenhum insight disponível.</p>
        <button
          onClick={generateInsights}
          className="cursor-pointer mt-3 text-primary text-sm font-semibold hover:underline"
        >
          Gerar novamente
        </button>
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
              <p className="text-xs text-text-muted mt-1">{insight.tipo}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
