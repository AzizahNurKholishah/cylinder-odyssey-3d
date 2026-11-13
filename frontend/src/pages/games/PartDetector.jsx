import { useMemo, useState } from 'react'
import { ObjectIcon } from '../../components/Diagrams.jsx'
import { Button, Card, Feedback } from '../../components/ui/index.jsx'
import { shuffle } from '../../lib/cylinder.js'
import { GameHud, useCountdown } from './shared.jsx'

const OBJECTS = [
  { kind: 'kaleng', name: 'Kaleng sarden tertutup', ans: 'closed', why: 'Kaleng tertutup punya alas, tutup, dan selimut.' },
  { kind: 'gelas', name: 'Gelas minum', ans: 'open', why: 'Gelas tidak bertutup: hanya alas + selimut.' },
  { kind: 'paralon', name: 'Pipa paralon (terbuka kedua ujung)', ans: 'blanket', why: 'Kedua ujung pipa terbuka: hanya selimut.' },
  { kind: 'tong', name: 'Drum terbuka bagian atas', ans: 'open', why: 'Drum terbuka atasnya: alas + selimut.' },
  { kind: 'ember', name: 'Ember', ans: 'open', why: 'Ember tidak bertutup: alas + selimut.' },
  { kind: 'label', name: 'Label kertas kaleng susu', ans: 'blanket', why: 'Label hanya melingkari sisi lengkung.' },
  { kind: 'drum', name: 'Drum minyak tertutup', ans: 'closed', why: 'Drum tertutup: 2 lingkaran + selimut.' },
  { kind: 'celengan', name: 'Celengan tabung (semua sisi dicat)', ans: 'closed', why: 'Semua sisi dicat: alas, tutup, dan selimut.' },
  { kind: 'tong', name: 'Tong sampah tanpa tutup', ans: 'open', why: 'Tanpa tutup: hanya 1 lingkaran.' },
  { kind: 'kaleng', name: 'Kaleng biskuit tertutup', ans: 'closed', why: 'Tertutup: 2 lingkaran + selimut.' },
]
const OPTIONS = [
  { id: 'closed', text: '2 Lingkaran + 1 Selimut' },
  { id: 'open', text: '1 Lingkaran + 1 Selimut' },
  { id: 'blanket', text: 'Selimut saja' },
]
const ROUNDS = 8
const LIMIT = 12

export default function PartDetector({ onFinish }) {
  const rounds = useMemo(() => shuffle(OBJECTS).slice(0, ROUNDS), [])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [left, setLeft] = useCountdown(LIMIT, () => choose('__timeout'), answer === null)
  const obj = rounds[i]

  function choose(id) {
    if (answer !== null) return
    const ok = id === obj.ans
    setAnswer(id)
    if (ok) setScore((s) => s + 10 + (20 / ROUNDS) * (left / LIMIT))
  }

  const next = () => {
    if (i + 1 >= ROUNDS) { onFinish(score); return }
    setI(i + 1)
    setAnswer(null)
    setLeft(LIMIT)
  }

  return (
    <Card>
      <GameHud round={i} total={ROUNDS} score={score} timeLeft={left} />
      <div className="flex flex-col items-center gap-2 py-3">
        <ObjectIcon kind={obj.kind} className="size-28" />
        <p className="text-center text-lg font-bold text-navy">{obj.name}</p>
        <p className="text-sm text-slate-500">Bagian permukaan apa saja yang dihitung luasnya?</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const state = answer === null ? '' : o.id === obj.ans ? 'bg-emerald-600 text-white ring-emerald-600' : o.id === answer ? 'bg-amber-500 text-white ring-amber-500' : 'opacity-60'
          return <button key={o.id} disabled={answer !== null} onClick={() => choose(o.id)} className={`min-h-12 rounded-xl bg-white px-3 font-bold ring-1 ring-slate-300 ${state}`}>{o.text}</button>
        })}
      </div>
      {answer !== null && (
        <div className="mt-3 space-y-3">
          <Feedback ok={answer === obj.ans}>{answer === '__timeout' ? 'Waktu habis! ' : answer === obj.ans ? 'Tepat! ' : 'Belum tepat. '}{obj.why}</Feedback>
          <Button onClick={next} className="w-full">{i + 1 >= ROUNDS ? 'Lihat Skor' : 'Ronde Berikutnya'}</Button>
        </div>
      )}
    </Card>
  )
}
