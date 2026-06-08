'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCategory, getParam } from '@/lib/examCatalog'

const inputCls = `w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm
  focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted outline-none`

function toDateInput(val) {
  if (!val) return ''
  return new Date(val).toISOString().split('T')[0]
}

export default function EditExamModal({ exam, onClose, onSuccess }) {
  const router = useRouter()
  const category = getCategory(exam.exam_category)

  // Parâmetros: os do catálogo da categoria + quaisquer extras já presentes no exame
  const catalogKeys = category ? category.params.map(p => p.key) : []
  const extraKeys = Object.keys(exam.values || {}).filter(k => !catalogKeys.includes(k))
  const fields = [
    ...(category ? category.params : []),
    ...extraKeys.map(k => getParam(k)),
  ]

  const initial = {}
  for (const f of fields) initial[f.key] = exam.values?.[f.key] ?? ''

  const [values, setValues]     = useState(initial)
  const [examDate, setExamDate] = useState(toDateInput(exam.exam_date))
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const cleaned = {}
    for (const [k, v] of Object.entries(values)) {
      if (v !== '' && v != null && !Number.isNaN(Number(v))) cleaned[k] = Number(v)
    }
    if (Object.keys(cleaned).length === 0) { setError('Preencha ao menos um valor.'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: cleaned, exam_date: examDate }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erro ao salvar.')
      }
      router.refresh()
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-border mx-2 md:mx-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-base font-bold text-text">Editar exame</h2>
            <p className="text-xs text-text-muted mt-0.5">{category?.label || exam.exam_category}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Data do exame</label>
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className={inputCls} required />
          </div>

          <div>
            <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Valores</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-text-secondary mb-1">
                    {f.label} {f.unit && <span className="text-text-muted">({f.unit})</span>}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={values[f.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                    className={inputCls}
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2">
              {loading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
