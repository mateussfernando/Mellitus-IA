'use client'

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function PatientHistoryModal({ patient, onClose }) {
  const examResults = patient.examResults ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border mx-2 md:mx-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">{patient.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-text">{patient.name}</h2>
              <p className="text-xs text-text-muted">
                {patient.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'} · {calcAge(patient.birth_date)} anos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        {/* Lista de exames */}
        <div className="overflow-y-auto flex-1">
          {examResults.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <svg className="w-10 h-10 mx-auto mb-3 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
              </svg>
              <p className="text-sm">Nenhum exame registrado.</p>
              <p className="text-xs text-text-muted mt-1">Upload de laudos em breve</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {examResults.map((exam, idx) => (
                <div key={exam.id} className="px-6 py-4 hover:bg-bg/60 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-muted">#{examResults.length - idx}</span>
                      <span className="text-sm font-semibold text-text">
                        {new Date(exam.exam_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {exam.exam_category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
