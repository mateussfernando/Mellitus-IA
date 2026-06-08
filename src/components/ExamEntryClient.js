'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EXAM_CATALOG, getCategory } from '@/lib/examCatalog'

const inputCls = `w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm
  focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400`

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function ExamEntryClient({ patient }) {
  const router = useRouter()
  const [mode, setMode] = useState('ia')

  // IA
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scannedData, setScannedData] = useState(null)

  // Manual
  const [category, setCategory] = useState(EXAM_CATALOG[0].key)
  const [examDate, setExamDate] = useState(todayISO())
  const [manualValues, setManualValues] = useState({})

  // comum
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeCategory = getCategory(category)

  function handleFileSelect(f) {
    if (!f) return
    setFile(f)
    setError('')
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  function done() {
    router.push('/dashboard')
    router.refresh()
  }

  async function handleScan(e) {
    e.preventDefault()
    if (!file) { setError('Selecione um arquivo.'); return }
    setLoading(true); setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/exams/scan', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao escanear.')
      setScannedData(data.exams)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveScanned() {
    setLoading(true); setError('')
    try {
      for (const exam of scannedData) {
        const res = await fetch(`/api/patients/${patient.id}/exams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exam_date: exam.exam_date || todayISO(),
            exam_category: exam.exam_category,
            values: exam.values,
            source_lab: exam.lab_name,
            source_type: file.type === 'application/pdf' ? 'pdf' : 'image',
          }),
        })
        if (!res.ok) throw new Error('Erro ao salvar exame.')
      }
      done()
    } catch (err) {
      setError(err.message); setLoading(false)
    }
  }

  async function handleSaveManual(e) {
    e.preventDefault()
    const values = {}
    for (const [k, v] of Object.entries(manualValues)) {
      if (v !== '' && v != null && !Number.isNaN(Number(v))) values[k] = Number(v)
    }
    if (Object.keys(values).length === 0) { setError('Preencha ao menos um valor.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/patients/${patient.id}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_date: examDate, exam_category: category, values, source_type: 'manual' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erro ao salvar.')
      }
      done()
    } catch (err) {
      setError(err.message); setLoading(false)
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
            <span className="text-slate-700 font-medium">Novo exame</span>
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
              {patient.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'} · {calcAge(patient.birth_date)} anos
            </p>
          </div>
        </div>

        {/* Confirmação dos dados extraídos pela IA */}
        {scannedData ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" /></svg>
              </span>
              <h2 className="text-lg font-bold text-slate-800">Confira os dados extraídos</h2>
            </div>

            <div className="space-y-4">
              {scannedData.map((exam, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    {getCategory(exam.exam_category)?.label || exam.exam_category}
                    {exam.exam_date ? ` — ${new Date(exam.exam_date).toLocaleDateString('pt-BR')}` : ''}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(exam.values || {}).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{k.replace(/_/g, ' ')}</p>
                        <p className="text-sm font-semibold text-slate-800">{v} {exam.units?.[k] || ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setScannedData(null)} className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                Voltar
              </button>
              <button onClick={handleSaveScanned} disabled={loading} className="cursor-pointer px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2">
                {loading ? (<><Spinner /> Salvando…</>) : 'Confirmar e Salvar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Seletor de método */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <MethodCard
                active={mode === 'ia'}
                onClick={() => { setMode('ia'); setError('') }}
                title="Ler laudo"
                desc="Envie um PDF ou foto"
                icon="M12 2.5l1.9 5.8a4 4 0 0 0 2.5 2.5L22.2 12l-5.8 1.9a4 4 0 0 0-2.5 2.5L12 22.2l-1.9-5.8a4 4 0 0 0-2.5-2.5L1.8 12l5.8-1.9a4 4 0 0 0 2.5-2.5L12 2.5z"
                filled
              />
              <MethodCard
                active={mode === 'manual'}
                onClick={() => { setMode('manual'); setError('') }}
                title="Inserir manualmente"
                desc="Digite os valores"
                icon="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
              />
            </div>

            {mode === 'ia' ? (
              <form onSubmit={handleScan} className="space-y-5">
                <div
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/40 hover:bg-slate-50 transition-colors"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]) }}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{file ? file.name : 'Clique ou arraste o laudo aqui'}</p>
                  <p className="text-xs text-slate-400 mt-1">PDF ou imagem · até alguns MB</p>
                  <input id="file-input" type="file" hidden onChange={e => handleFileSelect(e.target.files?.[0])} accept="image/*,.pdf" />
                </div>

                <p className="text-[11px] text-slate-400">Os valores são extraídos automaticamente para sua conferência.</p>

                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element -- preview de data-URL local
                  <img src={preview} alt="Preview" className="w-full rounded-2xl border border-slate-200 max-h-72 object-cover" />
                )}

                {error && <ErrorBox>{error}</ErrorBox>}

                <div className="flex justify-end gap-3">
                  <Link href="/dashboard" className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                    Cancelar
                  </Link>
                  <button type="submit" disabled={!file || loading} className="cursor-pointer px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                    {loading ? (<><Spinner /> Escaneando…</>) : 'Escanear com IA'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveManual} className="space-y-6">
                {/* Categoria como chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Categoria do exame</label>
                  <div className="flex flex-wrap gap-2">
                    {EXAM_CATALOG.map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => { setCategory(c.key); setManualValues({}) }}
                        className={`cursor-pointer px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors
                          ${category === c.key
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Data do exame</label>
                  <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className={inputCls} required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                    Valores <span className="text-slate-400 normal-case font-normal">— preencha os que tiver</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCategory.params.map(p => (
                      <div key={p.key}>
                        <label className="block text-xs text-slate-500 mb-1.5">
                          {p.label} {p.unit && <span className="text-slate-400">({p.unit})</span>}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={manualValues[p.key] ?? ''}
                          onChange={e => setManualValues(v => ({ ...v, [p.key]: e.target.value }))}
                          className={inputCls}
                          placeholder="—"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {error && <ErrorBox>{error}</ErrorBox>}

                <div className="flex justify-end gap-3 pt-2">
                  <Link href="/dashboard" className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                    Cancelar
                  </Link>
                  <button type="submit" disabled={loading} className="cursor-pointer px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2">
                    {loading ? (<><Spinner /> Salvando…</>) : 'Salvar exame'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MethodCard({ active, onClick, title, desc, icon, filled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer text-left rounded-2xl border p-4 transition-all
        ${active ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'border-slate-200 bg-white hover:border-primary/30'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
        <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-slate-700'}`}>{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </button>
  )
}

function ErrorBox({ children }) {
  return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{children}</p>
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
