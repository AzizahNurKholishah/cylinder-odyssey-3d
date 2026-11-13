import { CircleCheck, CircleX, Lightbulb } from 'lucide-react'
import { parseNumber } from '../lib/cylinder.js'

/** Validasi lokal sebelum dikirim: angka harus bisa dibaca. */
export function localStepError(step, value) {
  if (value === undefined || value === null || String(value).trim() === '') return 'Belum diisi.'
  if (step.kind === 'number' && parseNumber(String(value).replace(/^rp/i, '').replace(/lembar|kaleng/gi, '')) === null) {
    return 'Masukkan angka yang valid, contoh: 154 atau 38,5'
  }
  return null
}

/**
 * Menampilkan langkah-langkah soal (number / choice / text).
 * results: {step_id: {correct, feedback, points, max_points}} → umpan balik di dekat input (spatial contiguity).
 */
export default function QuestionSteps({ steps, answers, onChange, results, disabled = false, showErrors = false, showPoints = false }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => {
        const res = results?.[step.id]
        const val = answers[step.id] ?? ''
        const localErr = showErrors ? localStepError(step, val) : null
        const ring = res ? (res.correct ? 'ring-emerald-300 bg-emerald-50/50' : res.points > 0 ? 'ring-amber-300 bg-amber-50/50' : 'ring-red-200 bg-red-50/40') : 'ring-slate-200 bg-white'
        return (
          <li key={step.id} className={`rounded-xl p-3 ring-1 sm:p-4 ${ring}`}>
            <div className="mb-2 flex items-start gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>
              <p className="flex-1 font-semibold text-ink">{step.prompt}</p>
              {showPoints && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{res ? `${res.points}/` : ''}{step.score} poin</span>}
            </div>

            {step.kind === 'number' && (
              <label className="flex items-center gap-2">
                <input
                  inputMode="decimal"
                  autoComplete="off"
                  disabled={disabled}
                  value={val}
                  onChange={(e) => onChange(step.id, e.target.value)}
                  className="formula min-h-11 w-full max-w-56 rounded-lg border border-slate-300 bg-white px-3 text-lg focus:border-royal focus:outline-none disabled:bg-slate-100"
                  placeholder="Jawaban"
                  aria-label={step.prompt}
                />
                {step.unit && <span className="font-semibold text-slate-600">{step.unit}</span>}
              </label>
            )}

            {step.kind === 'choice' && (
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={step.prompt}>
                {step.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={val === o.id}
                    disabled={disabled}
                    onClick={() => onChange(step.id, o.id)}
                    className={`min-h-11 rounded-lg px-3 py-2 text-left font-medium ring-1 transition-colors ${val === o.id ? 'bg-royal text-white ring-royal' : 'bg-white ring-slate-300 hover:bg-blue-50'} disabled:cursor-default`}
                  >
                    <span className="formula">{o.text}</span>
                  </button>
                ))}
              </div>
            )}

            {step.kind === 'text' && (
              <textarea
                disabled={disabled}
                value={val}
                maxLength={1000}
                rows={3}
                onChange={(e) => onChange(step.id, e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 focus:border-royal focus:outline-none disabled:bg-slate-100"
                placeholder="Tulis alasanmu dengan kalimat sendiri..."
                aria-label={step.prompt}
              />
            )}

            {localErr && !res && <p className="mt-1 text-sm text-red-600">{localErr}</p>}
            {res && (
              <p className={`mt-2 flex items-start gap-1.5 text-sm ${res.correct ? 'text-emerald-700' : 'text-amber-800'}`}>
                {res.correct ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <CircleX className="mt-0.5 size-4 shrink-0" />}
                <span>{res.feedback}</span>
              </p>
            )}
            {res?.correct_answer && !res.correct && (
              <p className="mt-1 text-sm text-slate-700"><b>Jawaban tepat:</b> <span className="formula">{res.correct_answer}</span></p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function HintPanel({ hints, shown, onShowNext, disabled }) {
  return (
    <div className="rounded-xl bg-sun/10 p-3 ring-1 ring-sun/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-bold text-yellow-900"><Lightbulb className="size-5" /> Petunjuk Bertingkat</p>
        <button
          onClick={onShowNext}
          disabled={disabled || shown >= hints.length}
          className="rounded-lg bg-sun px-3 py-1.5 text-sm font-bold text-navy hover:bg-yellow-300 disabled:opacity-40"
        >
          {shown >= hints.length ? 'Semua petunjuk terbuka' : `Buka Hint ${shown + 1}`}
        </button>
      </div>
      {shown > 0 && (
        <ol className="mt-2 space-y-1.5">
          {hints.slice(0, shown).map((h, i) => (
            <li key={i} className="fade-in rounded-lg bg-white/70 px-3 py-2 text-sm"><b>Hint {i + 1}:</b> {h}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
