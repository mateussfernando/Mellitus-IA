'use client'
import { useState } from 'react'

const EMPTY = {
  name: '', cpf: '', birth_date: '',
  glicemia: '', pressao: '', imc: '', idade: '',
  gestacoes: '', espessura_pele: '', insulina: '', historico_familiar: '',
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = `w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm
  focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted`

export default function NewPatientModal({ isOpen, onClose, onSuccess }) {
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  if (!isOpen) return null

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const body = {
      name:      form.name,
      cpf:       form.cpf,
      birth_date: form.birth_date,
      glicemia:  Number(form.glicemia),
      pressao:   Number(form.pressao),
      imc:       Number(form.imc),
      idade:     Number(form.idade),
      ...(form.gestacoes          && { gestacoes:          Number(form.gestacoes) }),
      ...(form.espessura_pele     && { espessura_pele:     Number(form.espessura_pele) }),
      ...(form.insulina           && { insulina:           Number(form.insulina) }),
      ...(form.historico_familiar && { historico_familiar: Number(form.historico_familiar) }),
    }

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Erro ao salvar paciente.')
      setForm(EMPTY)
      onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-base font-bold text-text">Novo Paciente</h2>
            <p className="text-xs text-text-muted mt-0.5">A IA calculará o risco automaticamente</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Dados pessoais */}
          <section>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Dados Pessoais</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome completo" required>
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="João da Silva" required />
              </Field>
              <Field label="CPF" required>
                <input className={inputCls} value={form.cpf} onChange={e => set('cpf', e.target.value)}
                  placeholder="000.000.000-00" required />
              </Field>
              <Field label="Data de nascimento" required>
                <input type="date" className={inputCls} value={form.birth_date}
                  onChange={e => set('birth_date', e.target.value)} required />
              </Field>
              <Field label="Idade (anos)" required>
                <input type="number" className={inputCls} value={form.idade}
                  onChange={e => set('idade', e.target.value)} placeholder="45" min={1} max={120} required />
              </Field>
            </div>
          </section>

          {/* Dados clínicos obrigatórios */}
          <section>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Dados Clínicos</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Glicemia (mg/dL)" required>
                <input type="number" className={inputCls} value={form.glicemia}
                  onChange={e => set('glicemia', e.target.value)} placeholder="120" step="0.1" required />
              </Field>
              <Field label="Pressão arterial (mmHg)" required>
                <input type="number" className={inputCls} value={form.pressao}
                  onChange={e => set('pressao', e.target.value)} placeholder="80" step="0.1" required />
              </Field>
              <Field label="IMC (kg/m²)" required>
                <input type="number" className={inputCls} value={form.imc}
                  onChange={e => set('imc', e.target.value)} placeholder="28.5" step="0.1" required />
              </Field>
              <Field label="Gestações">
                <input type="number" className={inputCls} value={form.gestacoes}
                  onChange={e => set('gestacoes', e.target.value)} placeholder="0" min={0} />
              </Field>
            </div>
          </section>

          {/* Dados complementares */}
          <section>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Dados Complementares (opcional)</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Espessura da pele (mm)">
                <input type="number" className={inputCls} value={form.espessura_pele}
                  onChange={e => set('espessura_pele', e.target.value)} placeholder="20" step="0.1" />
              </Field>
              <Field label="Insulina (µU/mL)">
                <input type="number" className={inputCls} value={form.insulina}
                  onChange={e => set('insulina', e.target.value)} placeholder="79" step="0.1" />
              </Field>
              <Field label="Histórico familiar (0 a 1)">
                <input type="number" className={inputCls} value={form.historico_familiar}
                  onChange={e => set('historico_familiar', e.target.value)}
                  placeholder="0.5" step="0.001" min={0} max={1} />
              </Field>
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm
                         font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analisando IA…
                </>
              ) : 'Salvar e Analisar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
