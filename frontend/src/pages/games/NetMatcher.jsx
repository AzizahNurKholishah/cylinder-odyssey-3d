import { useMemo, useState } from 'react'
import { Button, Card, Feedback } from '../../components/ui/index.jsx'
import { choosePi, circumference, fmt, PI, shuffle } from '../../lib/cylinder.js'
import { GameHud } from './shared.jsx'

const SIZES = [[7, 10], [14, 5], [3.5, 12], [10, 8], [21, 6], [5, 15], [7, 20], [20, 10]]
const ROUNDS = 6

function makeRound([r, t]) {
  const { pi } = choosePi(r)
  const p = circumference(r, pi)
  const options = shuffle([
    { p, l: t, ok: true, why: 'Panjang = keliling alas (2πr) dan lebar = tinggi. Pas!' },
    { p: PI[pi] * r, l: t, why: 'Panjangnya hanya πr (lupa dikali 2). Selimut tidak bisa menutup penuh, ada celah.' },
    { p: 2 * p, l: t, why: 'Panjangnya 2πd (memakai diameter). Selimut kepanjangan, jadi berlebih.' },
    { p, l: 2 * t, why: 'Panjangnya benar, tetapi lebarnya 2 kali tinggi tabung. Berlebih!' },
  ]).slice(0, 3)
  if (!options.some((o) => o.ok)) options[0] = { p, l: t, ok: true, why: 'Panjang = keliling alas (2πr) dan lebar = tinggi. Pas!' }
  return { r, t, pi, options: shuffle(options) }
}

export default function NetMatcher({ onFinish }) {
  const rounds = useMemo(() => shuffle(SIZES).slice(0, ROUNDS).map(makeRound), [])
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [correct, setCorrect] = useState(0)
  const round = rounds[i]
  const maxP = Math.max(...round.options.map((o) => o.p))
  const maxL = Math.max(...round.options.map((o) => o.l))

  const choose = (k) => {
    if (pick !== null) return
    setPick(k)
    if (round.options[k].ok) setCorrect((c) => c + 1)
  }
  const next = () => {
    if (i + 1 >= ROUNDS) { onFinish((correct / ROUNDS) * 100); return }
    setI(i + 1)
    setPick(null)
  }

  return (
    <Card>
      <GameHud round={i} total={ROUNDS} score={(correct / ROUNDS) * 100} />
      <div className="mb-3 rounded-xl bg-paper p-3 text-center ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Tabung yang harus ditutup selimutnya:</p>
        <p className="formula text-xl font-bold text-navy">r = {fmt(round.r)} cm, t = {fmt(round.t)} cm</p>
        <p className="text-xs text-slate-500">(π = {round.pi === '22/7' ? '22/7' : '3,14'})</p>
      </div>
      <p className="mb-2 font-semibold">Pilih persegi panjang yang pas:</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {round.options.map((o, k) => {
          const w = 30 + (o.p / maxP) * 70
          const h = 20 + (o.l / maxL) * 50
          const state = pick === null ? 'ring-slate-300 hover:ring-royal' : o.ok ? 'ring-emerald-500 bg-emerald-50' : pick === k ? 'ring-amber-500 bg-amber-50' : 'opacity-50 ring-slate-200'
          return (
            <button key={k} onClick={() => choose(k)} disabled={pick !== null} className={`flex flex-col items-center gap-2 rounded-xl bg-white p-3 ring-2 ${state}`}>
              <svg viewBox="0 0 110 80" className="h-20 w-full" aria-hidden="true">
                <rect x={(110 - w) / 2} y={(80 - h) / 2} width={w} height={h} fill="#60A5FA" stroke="#1e40af" strokeWidth="1.5" rx="2" />
              </svg>
              <span className="formula text-sm font-bold">{fmt(o.p, 2)} × {fmt(o.l, 2)} cm</span>
            </button>
          )
        })}
      </div>
      {pick !== null && (
        <div className="mt-3 space-y-3">
          <Feedback ok={round.options[pick].ok}>{round.options[pick].why}{!round.options[pick].ok && ` Yang tepat: ${fmt(circumference(round.r, round.pi), 2)} × ${fmt(round.t)} cm.`}</Feedback>
          <Button onClick={next} className="w-full">{i + 1 >= ROUNDS ? 'Lihat Skor' : 'Ronde Berikutnya'}</Button>
        </div>
      )}
    </Card>
  )
}
