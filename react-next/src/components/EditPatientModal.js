'use client'
import { useState } from 'react'

const inputCls = `w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm
  focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted outline-none`

function toDateInput(val) {
  if (!val) return ''
  return new Date(val).toISOString().split('T')[0]
}

export default function EditPatientModal({ patient, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:       patient.name       ?? '',
    sexo:       patient.sexo       ?? 'FEMININO',
    birth_date: toDateInput(patient.birth_date),
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/patients/${patient.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(res.status === 500 ? 'Erro interno. Tente novamente.' : (data.detail ?? 'Erro ao atualizar.'))
      onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md border border-border mx-2 md:mx-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-text">Editar Paciente</h2>
          <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Nome completo</label>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Sexo</label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {['FEMININO', 'MASCULINO'].map(s => (
                <button key={s} type="button" onClick={() => set('sexo', s)}
                  className={`cursor-pointer flex-1 py-2 text-sm font-semibold transition-colors
                    ${form.sexo === s ? 'bg-primary text-white' : 'bg-bg text-text-secondary hover:bg-border'}`}>
                  {s === 'FEMININO' ? '♀ Feminino' : '♂ Masculino'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Data de nascimento</label>
            <input type="date" className={inputCls} value={form.birth_date}
              onChange={e => set('birth_date', e.target.value)} required />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
