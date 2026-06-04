'use client'
import { useState } from 'react'
import RiskBadge from '@/components/RiskBadge'

const inputCls = `w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm
  focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted outline-none`

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

export default function NewConsultationModal({ patient, onClose, onSuccess }) {
  const isMasculino = patient.sexo === 'MASCULINO'

  const [form, setForm] = useState({
    glicemia: '', pressao: '', imc: '', idade: '',
    espessura_pele: '', insulina: '', historico_familiar: '',
    gestacoes: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [resultado, setResultado] = useState(null)

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResultado(null)
    try {
      const body = {
        glicemia:  Number(form.glicemia),
        pressao:   Number(form.pressao),
        imc:       Number(form.imc),
        idade:     Number(form.idade),
        ...(form.espessura_pele     && { espessura_pele:     Number(form.espessura_pele) }),
        ...(form.insulina           && { insulina:           Number(form.insulina) }),
        ...(form.historico_familiar && { historico_familiar: Number(form.historico_familiar) }),
        ...(!isMasculino && form.gestacoes && { gestacoes: Number(form.gestacoes) }),
      }

      const res  = await fetch(`/api/patients/${patient.id}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(res.status === 500 ? 'Erro interno. Tente novamente.' : (data.detail ?? 'Erro ao salvar consulta.'))

      setResultado(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (resultado) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-sm border border-border mx-2 md:mx-0 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text mb-1">Análise concluída</h3>
          <p className="text-sm text-text-secondary mb-6">{patient.name}</p>

          <div className="bg-bg rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Probabilidade</span>
              <span className="text-xl font-bold text-text">
                {(resultado.predicao_probabilidade * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Classificação</span>
              <RiskBadge risco={resultado.predicao_risco} />
            </div>
            {isMasculino && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-left">
                ⚠️ Ajuste clínico de +15% aplicado (modelo base treinado com dados femininos)
              </p>
            )}
          </div>

          <button
            onClick={() => { onSuccess(resultado) }}
            className="cursor-pointer w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-border mx-2 md:mx-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-base font-bold text-text">Nova Consulta</h2>
            <p className="text-xs text-text-muted mt-0.5">{patient.name} · {patient.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">

          {isMasculino && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-amber-500 text-lg leading-none">⚠️</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                O modelo foi treinado com dados femininos como base.
                Para pacientes do sexo masculino é aplicado um ajuste clínico de +15% na probabilidade.
              </p>
            </div>
          )}

          <section>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Dados Obrigatórios</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Field label="Idade (anos)" required>
                <input type="number" className={inputCls} value={form.idade}
                  onChange={e => set('idade', e.target.value)} placeholder="45" min={1} max={120} required />
              </Field>
            </div>
          </section>

          <section>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Dados Complementares (opcional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {!isMasculino && (
                <Field label="Gestações">
                  <input type="number" className={inputCls} value={form.gestacoes}
                    onChange={e => set('gestacoes', e.target.value)} placeholder="0" min={0} />
                </Field>
              )}
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analisando…
                </>
              ) : 'Analisar com IA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
