'use client'
import { useState } from 'react'
import Link from 'next/link'
import { getCategory } from '@/lib/examCatalog'

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

const TIPO_ICON = {
  tendencia:  'M13 7h8m0 0v8m0-8L5.343 19.657',
  correlacao: 'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244',
  alerta:     'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
  sugestao:   'M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
}

const URGENCIA = {
  info:    { accent: 'bg-blue-400',    chip: 'bg-blue-50 text-blue-700',     ring: 'bg-blue-100 text-blue-600' },
  aviso:   { accent: 'bg-amber-400',   chip: 'bg-amber-50 text-amber-700',   ring: 'bg-amber-100 text-amber-600' },
  critico: { accent: 'bg-red-500',     chip: 'bg-red-50 text-red-700',       ring: 'bg-red-100 text-red-600' },
}

export default function PatientInsightsClient({ patient }) {
  const exams = patient.examResults ?? []
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true); setError('')
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

  return (
    <div className="min-h-full bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="text-sm text-slate-400">
            <Link href="/dashboard" className="cursor-pointer hover:text-slate-600">Pacientes</Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-700 font-medium">Análise</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* Cabeçalho do paciente */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0 text-white text-xl font-bold">
            {patient.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{patient.name}</h1>
            <p className="text-sm text-slate-500">
              {patient.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'} · {calcAge(patient.birth_date)} anos · {exams.length} exame{exams.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Sem exames */}
        {exams.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" /></svg>
            </div>
            <h2 className="text-base font-bold text-slate-700 mb-1">Nenhum exame para analisar</h2>
            <p className="text-sm text-slate-400 mb-5">É necessário pelo menos um exame para gerar a análise.</p>
            <Link href={`/dashboard/pacientes/${patient.id}/exame`} className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Adicionar exame
            </Link>
          </div>
        ) : (
          <>
            {/* Card de geração / hero */}
            {insights === null && !loading && (
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-10 text-center mb-8">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
                    <SparkIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Análise do histórico</h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    Cruza os {exams.length} exame{exams.length !== 1 ? 's' : ''} deste paciente para identificar
                    tendências, correlações entre domínios e possíveis alertas clínicos.
                  </p>
                  <button onClick={generate} className="cursor-pointer inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors shadow-lg shadow-primary/25">
                    <SparkIcon className="w-5 h-5" />
                    Gerar análise
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="rounded-3xl border border-slate-200 p-12 text-center mb-8">
                <svg className="w-7 h-7 mx-auto mb-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-medium text-slate-600">Analisando o histórico…</p>
                <p className="text-xs text-slate-400 mt-1">Isso pode levar alguns segundos</p>
              </div>
            )}

            {error && <div className="mb-6"><p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p></div>}

            {/* Resultado */}
            {insights && !loading && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Resultado da análise</h2>
                  <button onClick={generate} className="cursor-pointer flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    Gerar novamente
                  </button>
                </div>

                {insights.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum ponto relevante identificado.</p>
                ) : (
                  <div className="space-y-3">
                    {insights.map((ins, idx) => {
                      const u = URGENCIA[ins.urgencia] || URGENCIA.info
                      return (
                        <div key={idx} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 pl-6">
                          <div className={`absolute left-0 inset-y-0 w-1.5 ${u.accent}`} />
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${u.ring}`}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={TIPO_ICON[ins.tipo] || TIPO_ICON.sugestao} />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1.5 ${u.chip}`}>{ins.tipo}</span>
                              <p className="text-sm text-slate-700 leading-relaxed">{ins.descricao}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Exames analisados */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Exames considerados ({exams.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {exams.map(e => (
                  <div key={e.id} className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{getCategory(e.exam_category)?.label || e.exam_category}</p>
                      <p className="text-xs text-slate-400">{new Date(e.exam_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-xs text-slate-400">{Object.keys(e.values || {}).length} valores</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SparkIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.5l1.9 5.8a4 4 0 0 0 2.5 2.5L22.2 12l-5.8 1.9a4 4 0 0 0-2.5 2.5L12 22.2l-1.9-5.8a4 4 0 0 0-2.5-2.5L1.8 12l5.8-1.9a4 4 0 0 0 2.5-2.5L12 2.5z" />
    </svg>
  )
}
