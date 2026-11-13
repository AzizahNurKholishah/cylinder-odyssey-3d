import { useMemo, useState } from 'react'
import { Button, Card, Feedback } from '../../components/ui/index.jsx'
import { shuffle } from '../../lib/cylinder.js'
import { GameHud } from './shared.jsx'

const CASES = [
  {
    text: 'Kaleng susu TERTUTUP, r = 7 cm, t = 10 cm, π = 22/7',
    slots: ['2πr(r + t)', '2 × 22/7 × 7 × (7 + 10)', '748 cm²'],
    decoys: ['πr² + 2πrt', '2 × 22/7 × 14 × (14 + 10)', '594 cm²'],
    why: 'Tertutup → 2 lingkaran + selimut = 2πr(r + t) = 44 × 17 = 748 cm².',
  },
  {
    text: 'Gelas TANPA TUTUP, r = 7 cm, t = 5 cm, π = 22/7',
    slots: ['πr² + 2πrt', '22/7 × 7² + 2 × 22/7 × 7 × 5', '374 cm²'],
    decoys: ['2πr(r + t)', '2 × 22/7 × 7 × (7 + 5)', '528 cm²'],
    why: 'Tanpa tutup → 1 lingkaran + selimut = 154 + 220 = 374 cm².',
  },
  {
    text: 'Pipa paralon TERBUKA KEDUA UJUNG, d = 20 cm, t = 15 cm, π = 3,14',
    slots: ['2πrt', '2 × 3,14 × 10 × 15', '942 cm²'],
    decoys: ['πr² + 2πrt', '2 × 3,14 × 20 × 15', '1.884 cm²'],
    why: 'Selimut saja, dan r = 20 ÷ 2 = 10 → 2 × 3,14 × 10 × 15 = 942 cm².',
  },
  {
    text: 'Kaleng biskuit TERTUTUP, d = 14 cm, t = 20 cm, π = 22/7',
    slots: ['2πr(r + t)', '2 × 22/7 × 7 × (7 + 20)', '1.188 cm²'],
    decoys: ['2πrt', '2 × 22/7 × 14 × (14 + 20)', '880 cm²'],
    why: 'r = 14 ÷ 2 = 7 → 44 × 27 = 1.188 cm².',
  },
]
const SLOT_NAMES = ['Rumus', 'Substitusi', 'Hasil']

export default function FormulaBuilder({ onFinish }) {
  const [i, setI] = useState(0)
  const [filled, setFilled] = useState([null, null, null])
  const [checked, setChecked] = useState(false)
  const [total, setTotal] = useState(0)
  const c = CASES[i]
  const pool = useMemo(() => shuffle([...c.slots, ...c.decoys]), [c])
  const used = new Set(filled.filter(Boolean))
  const correctCount = filled.filter((b, k) => b === c.slots[k]).length

  const place = (b) => {
    if (checked || used.has(b)) return
    const k = filled.indexOf(null)
    if (k < 0) return
    const n = [...filled]
    n[k] = b
    setFilled(n)
  }
  const clearSlot = (k) => { if (!checked) { const n = [...filled]; n[k] = null; setFilled(n) } }
  const check = () => { setChecked(true); setTotal((t) => t + (correctCount / 3) * 25) }
  const next = () => {
    if (i + 1 >= CASES.length) { onFinish(total); return }
    setI(i + 1); setFilled([null, null, null]); setChecked(false)
  }

  return (
    <Card>
      <GameHud round={i} total={CASES.length} score={total} />
      <p className="mb-3 rounded-xl bg-paper p-3 text-center font-bold text-navy ring-1 ring-slate-200">{c.text}</p>
      <ol className="mb-4 space-y-2">
        {SLOT_NAMES.map((name, k) => {
          const b = filled[k]
          const st = !checked ? 'ring-slate-300 bg-slate-50' : b === c.slots[k] ? 'ring-emerald-500 bg-emerald-50' : 'ring-amber-500 bg-amber-50'
          return (
            <li key={name}>
              <button onClick={() => clearSlot(k)} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left ring-2 ring-dashed ${st}`} aria-label={`Slot ${name}${b ? `: ${b}` : ' kosong'}`}>
                <span className="w-24 shrink-0 text-xs font-bold uppercase text-slate-500">{k + 1}. {name}</span>
                <span className="formula font-semibold">{b || '…'}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="mb-2 text-sm font-semibold text-slate-600">Blok tersedia (ketuk untuk menaruh):</p>
      <div className="flex flex-wrap gap-2">
        {pool.map((b) => (
          <button key={b} disabled={used.has(b) || checked} onClick={() => place(b)} className="formula min-h-11 rounded-lg bg-lilac/20 px-3 text-sm font-bold text-violet-900 ring-1 ring-lilac/50 disabled:opacity-30">{b}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {!checked
          ? <Button onClick={check} disabled={filled.includes(null)} className="w-full">Periksa Susunan</Button>
          : (
            <>
              <Feedback ok={correctCount === 3}>{correctCount}/3 slot benar. {c.why}</Feedback>
              <Button onClick={next} className="w-full">{i + 1 >= CASES.length ? 'Lihat Skor' : 'Kasus Berikutnya'}</Button>
            </>
          )}
      </div>
    </Card>
  )
}
