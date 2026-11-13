import { useState } from 'react'
import { DoorOpen, Lock } from 'lucide-react'
import { Companion } from '../../components/Brand.jsx'
import { ObjectIcon } from '../../components/Diagrams.jsx'
import { Button, Card, Feedback } from '../../components/ui/index.jsx'
import { matchesAnswer, parseNumber } from '../../lib/cylinder.js'
import { GameHud } from './shared.jsx'

const GATES = [
  {
    name: 'Gerbang Tangki Air',
    icon: 'drum',
    story: 'Arsitek Desa ingin melapisi seluruh permukaan tangki air TERTUTUP dengan cat anti karat. Jari-jari tangki 70 cm dan tingginya 150 cm. Gunakan π = 22/7.',
    tasks: [
      { kind: 'choice', q: 'Rumus yang tepat?', options: ['2πr(r + t)', 'πr² + 2πrt', '2πrt'], ans: 0, hint: 'Tangki tertutup punya alas DAN tutup.' },
      { kind: 'number', q: 'Luas permukaan tangki (cm²)?', ans: 96800, hint: '2 × 22/7 × 70 × (70 + 150) = 440 × 220' },
    ],
  },
  {
    name: 'Gerbang Kemasan Produk',
    icon: 'kaleng',
    story: 'UMKM desa membuat kemasan keripik berbentuk tabung TERTUTUP dengan diameter 14 cm dan tinggi 20 cm. Berapa luas bahan untuk satu kemasan? Gunakan π = 22/7.',
    tasks: [
      { kind: 'number', q: 'Jari-jari kemasan (cm)?', ans: 7, hint: 'r = d ÷ 2' },
      { kind: 'number', q: 'Luas bahan satu kemasan (cm²)?', ans: 1188, hint: '2 × 22/7 × 7 × (7 + 20) = 44 × 27' },
    ],
  },
  {
    name: 'Gerbang Pilar Taman',
    icon: 'paralon',
    story: 'Pilar taman berbentuk tabung berdiameter 42 cm dan tinggi 3 m. Hanya SISI LENGKUNG pilar yang dicat (atas dan bawah tidak). Gunakan π = 22/7.',
    tasks: [
      { kind: 'number', q: 'Luas yang dicat dalam cm²? (ingat 3 m = 300 cm)', ans: 39600, hint: 'Selimut saja: 2 × 22/7 × 21 × 300' },
      { kind: 'number', q: 'Ubah ke m² (1 m² = 10.000 cm²)', ans: 3.96, hint: '39.600 ÷ 10.000' },
    ],
  },
]

export default function CylinderQuest({ onFinish }) {
  const [gate, setGate] = useState(0)
  const [task, setTask] = useState(0)
  const [lives, setLives] = useState(3)
  const [mistakes, setMistakes] = useState(0)
  const [value, setValue] = useState('')
  const [choice, setChoice] = useState(null)
  const [fb, setFb] = useState(null)
  const [opened, setOpened] = useState(false)
  const g = GATES[gate]
  const tk = g.tasks[task]
  const score = (gatesDone, m) => Math.max(0, gatesDone * 33.34 - m * 10)

  const submit = (e) => {
    e.preventDefault()
    let ok
    if (tk.kind === 'choice') {
      if (choice === null) return
      ok = choice === tk.ans
    } else {
      if (parseNumber(value) === null) { setFb({ ok: false, text: 'Masukkan angka yang valid.' }); return }
      ok = matchesAnswer(value, tk.ans)
    }
    if (!ok) {
      const nl = lives - 1
      setLives(nl)
      setMistakes((m) => m + 1)
      setFb({ ok: false, text: `Belum tepat. Petunjuk: ${tk.hint}` })
      if (nl <= 0) setTimeout(() => onFinish(score(gate, mistakes + 1)), 1200)
      return
    }
    setFb({ ok: true, text: 'Tepat!' })
    setValue('')
    setChoice(null)
    if (task + 1 < g.tasks.length) { setTask(task + 1); return }
    setOpened(true)
  }

  const nextGate = () => {
    if (gate + 1 >= GATES.length) { onFinish(score(GATES.length, mistakes)); return }
    setGate(gate + 1); setTask(0); setOpened(false); setFb(null)
  }

  return (
    <Card>
      <GameHud score={score(gate + (opened ? 1 : 0), mistakes)} lives={lives} />
      <div className="mb-3 flex justify-center gap-2" aria-label="Gerbang">
        {GATES.map((x, k) => (
          <span key={x.name} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${k < gate || (k === gate && opened) ? 'bg-emerald-100 text-emerald-800' : k === gate ? 'bg-sun text-navy' : 'bg-slate-100 text-slate-400'}`}>
            {k < gate || (k === gate && opened) ? <DoorOpen className="size-3.5" /> : <Lock className="size-3.5" />} {k + 1}
          </span>
        ))}
      </div>
      <div className="flex items-start gap-3">
        <ObjectIcon kind={g.icon} className="size-16 shrink-0" />
        <div>
          <h2 className="font-black text-navy">{g.name}</h2>
          <p className="text-[0.95rem]">{g.story}</p>
        </div>
      </div>

      {!opened ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <p className="font-semibold">Tantangan {task + 1}/{g.tasks.length}: {tk.q}</p>
          {tk.kind === 'choice' ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {tk.options.map((o, k) => (
                <button type="button" key={o} onClick={() => setChoice(k)} className={`formula min-h-12 rounded-xl font-bold ring-1 ${choice === k ? 'bg-royal text-white ring-royal' : 'bg-white ring-slate-300'}`}>{o}</button>
              ))}
            </div>
          ) : (
            <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="formula min-h-12 w-full max-w-60 rounded-xl border-2 border-slate-300 px-3 text-xl" aria-label={tk.q} />
          )}
          <Button type="submit" disabled={lives <= 0}>Jawab</Button>
          {fb && <Feedback ok={fb.ok}>{fb.text}</Feedback>}
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          <Companion dismissible={false} mood="wow">Gerbang terbuka! Terima kasih sudah membantu desa. {gate + 1 < GATES.length ? 'Ayo lanjut ke gerbang berikutnya!' : 'Semua gerbang sudah terbuka!'}</Companion>
          <Button onClick={nextGate} className="w-full">{gate + 1 < GATES.length ? 'Ke Gerbang Berikutnya' : 'Lihat Skor'}</Button>
        </div>
      )}
    </Card>
  )
}
