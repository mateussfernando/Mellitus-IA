'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ExamUploadModal({ patient, onClose }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [error, setError] = useState('')
  const router = useRouter()

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
    if (!file) {
      setError('Selecione um arquivo.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/exams/scan', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || 'Erro ao escanear.')

      setScannedData(data.exams)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!scannedData) return
    setLoading(true)
    setError('')

    try {
      for (const exam of scannedData) {
        const res = await fetch(`/api/patients/${patient.id}/exams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exam_date: exam.exam_date,
            exam_category: exam.exam_category,
            values: exam.values,
            source_lab: exam.lab_name,
            source_type: file.type === 'application/pdf' ? 'pdf' : 'image',
            raw_ocr_text: exam.raw_text,
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

  if (scannedData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl border border-border mx-2 md:mx-0 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
            <h2 className="text-base font-bold text-text">Confirmar dados extraídos</h2>
            <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {scannedData.map((exam, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-text mb-3">
                  {exam.exam_category} — {new Date(exam.exam_date).toLocaleDateString('pt-BR')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(exam.values || {}).map(([k, v]) => (
                    <div key={k} className="bg-bg rounded p-2">
                      <p className="text-xs text-text-muted uppercase">{k}</p>
                      <p className="text-sm font-semibold text-text">
                        {v} {exam.units?.[k] ? `${exam.units[k]}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button
                onClick={() => setScannedData(null)}
                className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {loading ? 'Salvando…' : 'Confirmar e Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md border border-border mx-2 md:mx-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-text">Upload de laudo</h2>
          <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleScan} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase">
              Selecione um PDF ou imagem
            </label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-bg transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                handleFileSelect(f)
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75Z" />
              </svg>
              <p className="text-sm font-medium text-text">{file ? file.name : 'Clique ou arraste um arquivo'}</p>
              <input id="file-input" type="file" hidden onChange={e => handleFileSelect(e.target.files?.[0])} accept="image/*,.pdf" />
            </div>
          </div>

          {preview && (
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-2 uppercase">Preview</p>
              <img src={preview} alt="Preview" className="w-full rounded-lg border border-border max-h-64 object-cover" />
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg border border-border transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="cursor-pointer px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Escaneando…
                </>
              ) : (
                'Escanear com IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
