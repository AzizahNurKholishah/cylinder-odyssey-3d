import { useMemo, useRef, useState } from 'react'
import { Button, Card, Feedback } from '../../components/ui/index.jsx'
import { choosePi, fmt, matchesAnswer, parseNumber, PI_LABEL, shuffle } from '../../lib/cylinder.js'
import { GameHud, useCountdown } from './shared.jsx'

const DIAMETERS = [14, 28, 42, 7, 21, 10, 20, 30, 16, 24, 50, 35, 9, 12, 56, 40, 70, 18]

export default function RadiusPiSprint({ onFinish }) {
  const items = useMemo(() => shuffle(DIAMETERS), [])
  const [i, setI] = useState(0)
  const [r, setR] = useState('')
  const [pi, setPi] = useState(null)
  const [score, setScore] = useState(0)
  const [fb, setFb] = useState(null)
  const scoreRef = useRef(0)
  const [left] = useCountdown(75, () => onFinish(scoreRef.current))
  const d = items[i % items.length]
  const ans = choosePi(d / 2)

  const submit = (e) => {
    e.preventDefault()
    const v = parseNumber(r)
    if (v === null || !pi) { setFb({ ok: false, text: 'Isi jari-jari dan pilih π dulu.' }); return }
    const okR = matchesAnswer(r, d / 2)
    const okPi = pi === ans.pi
    if (okR && okPi) {
      scoreRef.current = Math.min(100, scoreRef.current + 10)
      setScore(scoreRef.current)
      setFb({ ok: true, text: `Tepat! r = ${fmt(d / 2)} cm, π = ${PI_LABEL[ans.pi]}.` })
      if (scoreRef.current >= 100) { onFinish(100); return }
    } else {
      const parts = []
      if (!okR) parts.push(v === d ? 'Itu diameternya. r = d ÷ 2.' : `r = ${d} ÷ 2 = ${fmt(d / 2)}.`)
      if (!okPi) parts.push(ans.reason)
      setFb({ ok: false, text: parts.join(' ') })
    }
    setI(i + 1)
    setR('')
    setPi(null)
  }

  return (
    <Card>
      <GameHud score={score} timeLeft={left} />
      <form onSubmit={submit} className="space-y-4">
        <p className="text-center font-display text-4xl font-black text-navy">d = {d} cm</p>
        <label className="flex items-center justify-center gap-2 text-lg font-semibold">
          r =
          <input autoFocus inputMode="decimal" value={r} onChange={(e) => setR(e.target.value)} className="formula min-h-12 w-28 rounded-xl border-2 border-slate-300 px-3 text-xl" aria-label="Jari-jari" />
          cm
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['22/7', '3.14'].map((p) => (
            <button type="button" key={p} onClick={() => setPi(p)} className={`min-h-12 rounded-xl font-bold ring-1 ${pi === p ? 'bg-royal text-white ring-royal' : 'bg-white ring-slate-300'}`}>π = {PI_LABEL[p]}</button>
          ))}
        </div>
        <Button type="submit" className="w-full">Kirim</Button>
      </form>
      {fb && <div className="mt-3"><Feedback ok={fb.ok}>{fb.text}</Feedback></div>}
    </Card>
  )
}
