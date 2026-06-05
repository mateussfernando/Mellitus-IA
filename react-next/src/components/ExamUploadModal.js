'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EXAM_CATALOG, getCategory } from '@/lib/examCatalog'

const inputCls = `w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm
  focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted outline-none`

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function ExamUploadModal({ patient, onClose }) {
  const [mode, setMode] = useState('ia') // 'ia' | 'manual'
  const router = useRouter()

  // ---------- IA ----------
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scannedData, setScannedData] = useState(null)

  // ---------- Manual ----------
  const [category, setCategory] = useState(EXAM_CATALOG[0].key)
  const [examDate, setExamDate] = useState(todayISO())
  const [manualValues, setManualValues] = useState({})

  // ---------- comum ----------
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    if (!scannedData) return
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
      router.refresh()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveManual(e) {
    e.preventDefault()
    const values = {}
    for (const [k, v] of Object.entries(manualValues)) {
      if (v !== '' && v != null && !Number.isNaN(Number(v))) values[k] = Number(v)
    }
    if (Object.keys(values).length === 0) {
      setError('Preencha ao menos um valor.')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/patients/${patient.id}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_date: examDate,
          exam_category: category,
          values,
          source_type: 'manual',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erro ao salvar.')
      }
      router.refresh()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeCategory = getCategory(category)

  // ===== Tela de confirmação do scan da IA =====
  if (scannedData) {
    return (
      <Shell onClose={onClose} title="Confirmar dados extraídos">
        <div className="p-6 space-y-4">
          {scannedData.map((exam, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-text mb-3">
                {getCategory(exam.exam_category)?.label || exam.exam_category}
                {exam.exam_date ? ` — ${new Date(exam.exam_date).toLocaleDateString('pt-BR')}` : ''}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(exam.values || {}).map(([k, v]) => (
                  <div key={k} className="bg-bg rounded p-2">
                    <p className="text-xs text-text-muted uppercase">{k.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-semibold text-text">
                      {v} {exam.units?.[k] || ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {error && <ErrorBox>{error}</ErrorBox>}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button onClick={() => setScannedData(null)} className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Voltar
            </button>
            <button onClick={handleSaveScanned} disabled={loading} className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {loading ? 'Salvando…' : 'Confirmar e Salvar'}
            </button>
          </div>
        </div>
      </Shell>
    )
  }

  // ===== Modal principal com abas =====
  return (
    <Shell onClose={onClose} title="Adicionar exame" subtitle={patient.name}>
      {/* Abas IA / Manual */}
      <div className="flex gap-2 px-6 pt-4">
        <TabButton active={mode === 'ia'} onClick={() => { setMode('ia'); setError('') }}>
          ✦ Ler laudo com IA
        </TabButton>
        <TabButton active={mode === 'manual'} onClick={() => { setMode('manual'); setError('') }}>
          Inserir manualmente
        </TabButton>
      </div>

      {mode === 'ia' ? (
        <form onSubmit={handleScan} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase">Selecione um PDF ou imagem</label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-bg transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]) }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75Z" />
              </svg>
              <p className="text-sm font-medium text-text">{file ? file.name : 'Clique ou arraste um arquivo'}</p>
              <input id="file-input" type="file" hidden onChange={e => handleFileSelect(e.target.files?.[0])} accept="image/*,.pdf" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.5l1.9 5.8a4 4 0 0 0 2.5 2.5L22.2 12l-5.8 1.9a4 4 0 0 0-2.5 2.5L12 22.2l-1.9-5.8a4 4 0 0 0-2.5-2.5L1.8 12l5.8-1.9a4 4 0 0 0 2.5-2.5L12 2.5z" />
              </svg>
              <span className="text-[11px] text-text-muted">Leitura automática por Claude · Anthropic</span>
            </div>
          </div>

          {preview && (
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-2 uppercase">Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- preview de data-URL local, next/image não se aplica */}
              <img src={preview} alt="Preview" className="w-full rounded-lg border border-border max-h-64 object-cover" />
            </div>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!file || loading} className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? (<><Spinner /> Escaneando…</>) : 'Escanear com IA'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveManual} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase">Categoria</label>
              <select
                value={category}
                onChange={e => { setCategory(e.target.value); setManualValues({}) }}
                className={`${inputCls} cursor-pointer`}
              >
                {EXAM_CATALOG.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase">Data do exame</label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className={inputCls} required />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-text-secondary mb-2 uppercase">
              Valores <span className="text-text-muted normal-case font-normal">(preencha os que tiver)</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCategory.params.map(p => (
                <div key={p.key}>
                  <label className="block text-xs text-text-secondary mb-1">
                    {p.label} {p.unit && <span className="text-text-muted">({p.unit})</span>}
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

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2">
              {loading ? (<><Spinner /> Salvando…</>) : 'Salvar exame'}
            </button>
          </div>
        </form>
      )}
    </Shell>
  )
}

function Shell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-xl border border-border mx-2 md:mx-0 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-base font-bold text-text">{title}</h2>
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors
        ${active ? 'bg-primary text-white' : 'bg-bg text-text-secondary hover:bg-border'}`}
    >
      {children}
    </button>
  )
}

function ErrorBox({ children }) {
  return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{children}</p>
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
