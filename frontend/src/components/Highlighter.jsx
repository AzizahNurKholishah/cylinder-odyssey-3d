import { useMemo, useState } from 'react'
import { Eraser, Highlighter as HighlighterIcon, Sparkles } from 'lucide-react'

/**
 * Teks soal cerita yang bisa disorot siswa (ketuk kata) — mengurangi beban membaca (EL05).
 * `phrases` = daftar frasa penting untuk tombol "Sorot otomatis".
 */
export default function Highlighter({ text, phrases = [], allowAuto = true, className = '' }) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text])
  const [marked, setMarked] = useState(() => new Set())

  const toggle = (i) => setMarked((cur) => {
    const next = new Set(cur)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  const autoHighlight = () => {
    const next = new Set(marked)
    // cari posisi karakter tiap token, tandai token yang berada di dalam frasa penting
    let pos = 0
    const spans = tokens.map((tk) => { const s = [pos, pos + tk.length]; pos += tk.length; return s })
    const lower = text.toLowerCase()
    for (const ph of phrases) {
      let from = 0
      const target = ph.toLowerCase()
      while (true) {
        const at = lower.indexOf(target, from)
        if (at < 0) break
        spans.forEach(([a, b], i) => { if (tokens[i].trim() && a < at + target.length && b > at) next.add(i) })
        from = at + target.length
      }
    }
    setMarked(next)
  }

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 font-semibold text-slate-500"><HighlighterIcon className="size-4" /> Ketuk kata untuk menyorot info penting</span>
        {allowAuto && phrases.length > 0 && (
          <button onClick={autoHighlight} className="flex items-center gap-1 rounded-full bg-lilac/20 px-2.5 py-1 font-semibold text-violet-800 hover:bg-lilac/30">
            <Sparkles className="size-3.5" /> Sorot otomatis
          </button>
        )}
        {marked.size > 0 && (
          <button onClick={() => setMarked(new Set())} className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-200">
            <Eraser className="size-3.5" /> Hapus sorotan
          </button>
        )}
      </div>
      <p className="rounded-xl bg-paper p-4 text-[1.05rem] leading-8 ring-1 ring-slate-200">
        {tokens.map((tk, i) => (/^\s+$/.test(tk) ? tk : (
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => toggle(i)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(i))}
            className={`cursor-pointer rounded px-0.5 transition-colors ${marked.has(i) ? 'bg-sun/70 font-semibold text-navy' : 'hover:bg-yellow-100'}`}
          >
            {tk}
          </span>
        )))}
      </p>
    </div>
  )
}
