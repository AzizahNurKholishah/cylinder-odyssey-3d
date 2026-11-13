export const INDICATOR_SHORT = {
  reasoning: 'Reasoning',
  formulating: 'Formulating',
  employing: 'Employing',
  evaluating: 'Interpreting & Evaluating',
}

const COLORS = { reasoning: 'bg-royal', formulating: 'bg-lilac', employing: 'bg-selimut', evaluating: 'bg-alas' }

/** Grafik batang skor 4 indikator Mathematical Literacy (0–6) + total (0–24). */
export default function LiteracyBars({ scores, total, indicators }) {
  return (
    <div className="space-y-3">
      {Object.keys(INDICATOR_SHORT).map((k) => (
        <div key={k}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-semibold text-ink" title={indicators?.[k]}>{INDICATOR_SHORT[k]}</span>
            <span className="formula font-bold">{scores[k]}/6</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${INDICATOR_SHORT[k]}: ${scores[k]} dari 6`}>
            <div className={`h-full rounded-full ${COLORS[k]} transition-all duration-700`} style={{ width: `${(scores[k] / 6) * 100}%` }} />
          </div>
          {indicators?.[k] && <p className="mt-0.5 text-xs text-slate-500">{indicators[k]}</p>}
        </div>
      ))}
      {total !== undefined && (
        <div className="flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-white">
          <span className="font-bold">Total Skor Literasi</span>
          <span className="formula text-2xl font-black text-sun">{total}/24</span>
        </div>
      )}
    </div>
  )
}
