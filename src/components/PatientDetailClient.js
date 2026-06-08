'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EditPatientModal from '@/components/EditPatientModal'
import { getCategory, getParam } from '@/lib/examCatalog'
import { checkThreshold } from '@/lib/alerts'

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function formatCpf(cpf) {
  if (!cpf) return '—'
  const d = String(cpf).replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// Valor mais recente de um parâmetro entre todos os exames (já vêm ordenados desc)
function latestValue(exams, key) {
  for (const e of exams) {
    if (e.values && e.values[key] != null) return { value: e.values[key], date: e.exam_date }
  }
  return null
}

function valueClasses(status) {
  if (status === 'CRITICAL') return 'text-red-600'
  if (status === 'HIGH' || status === 'LOW' || status === 'BORDERLINE') return 'text-amber-600'
  return 'text-slate-800'
}

const SOURCE_LABEL = { pdf: 'PDF', image: 'Imagem', manual: 'Manual' }

export default function PatientDetailClient({ patient }) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const exams = patient.examResults ?? []
  const sexo = patient.sexo

  const vitals = [
    { key: 'peso',              label: 'Peso',     unit: 'kg' },
    { key: 'altura',            label: 'Altura',   unit: 'cm' },
    { key: 'imc',               label: 'IMC',      unit: 'kg/m²' },
    { key: 'glicemia',          label: 'Glicemia', unit: 'mg/dL' },
    { key: 'pressao_sistolica', label: 'Pressão',  unit: 'mmHg' },
  ].map(v => ({ ...v, ...latestValue(exams, v.key) }))

  const lastExam = exams[0]

  return (
    <div className="min-h-full bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="text-sm text-slate-400">
            <Link href="/dashboard" className="cursor-pointer hover:text-slate-600">Pacientes</Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-700 font-medium">{patient.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-10 space-y-8">

        {/* Identidade + ações */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0 text-white text-2xl font-bold">
              {patient.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'} · {calcAge(patient.birth_date)} anos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/pacientes/${patient.id}/exame`} className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Novo exame
            </Link>
            <Link href={`/dashboard/pacientes/${patient.id}/insights`} className="cursor-pointer flex items-center px-4 py-2.5 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-600 hover:text-white text-sm font-semibold transition-colors">
              Análise
            </Link>
            <button onClick={() => setShowEdit(true)} className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
              Editar
            </button>
          </div>
        </div>

        {/* Dados básicos */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Dados do paciente</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoTile label="CPF" value={formatCpf(patient.cpf)} />
            <InfoTile label="Sexo" value={sexo === 'MASCULINO' ? 'Masculino' : 'Feminino'} />
            <InfoTile label="Idade" value={`${calcAge(patient.birth_date)} anos`} />
            <InfoTile label="Nascimento" value={new Date(patient.birth_date).toLocaleDateString('pt-BR')} />
          </div>
        </section>

        {/* Medidas mais recentes */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Medidas mais recentes</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {vitals.map(v => {
              const status = v.value != null ? checkThreshold(v.key, v.value, sexo) : null
              return (
                <div key={v.key} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{v.label}</p>
                  <p className={`text-xl font-bold mt-1 ${valueClasses(status)}`}>
                    {v.value != null ? Number(v.value).toFixed(v.key === 'imc' ? 1 : 0) : '—'}
                  </p>
                  <p className="text-[10px] text-slate-400">{v.unit}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Mini dashboard */}
        <section className="grid grid-cols-3 gap-3">
          <StatTile label="Exames" value={exams.length} />
          <StatTile label="Último exame" value={lastExam ? new Date(lastExam.exam_date).toLocaleDateString('pt-BR') : '—'} small />
          <StatTile label="Categorias" value={new Set(exams.map(e => e.exam_category)).size} />
        </section>

        {/* Histórico de exames com valores */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Histórico de exames</h2>
          {exams.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 py-12 text-center text-slate-400">
              <p className="text-sm">Nenhum exame registrado.</p>
              <Link href={`/dashboard/pacientes/${patient.id}/exame`} className="cursor-pointer mt-3 inline-block text-primary text-sm font-semibold hover:underline">
                Adicionar primeiro exame
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((exam, idx) => {
                const entries = Object.entries(exam.values || {})
                return (
                  <div key={exam.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-400">#{exams.length - idx}</span>
                        <span className="text-sm font-semibold text-slate-700">{getCategory(exam.exam_category)?.label || exam.exam_category}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                          {SOURCE_LABEL[exam.source_type] || exam.source_type}{exam.source_lab && exam.source_lab !== 'manual' ? ` · ${exam.source_lab}` : ''}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(exam.exam_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="p-4">
                      {entries.length === 0 ? (
                        <p className="text-sm text-slate-400">Sem valores.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {entries.map(([k, v]) => {
                            const meta = getParam(k)
                            const status = checkThreshold(k, v, sexo)
                            return (
                              <div key={k} className="bg-slate-50 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{meta.label}</p>
                                <p className={`text-sm font-bold mt-0.5 ${valueClasses(status)}`}>
                                  {v} <span className="text-[10px] font-normal text-slate-400">{meta.unit}</span>
                                  {status && status !== 'NORMAL' && (
                                    <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle ${status === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-400'}`} />
                                  )}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {showEdit && (
        <EditPatientModal
          patient={patient}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1 break-words">{value}</p>
    </div>
  )
}

function StatTile({ label, value, small }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
      <p className={`font-bold text-slate-800 ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
      <p className="text-[11px] text-slate-400 mt-1">{label}</p>
    </div>
  )
}
