import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Play, RotateCcw, Trophy } from 'lucide-react'
import { Companion } from '../../components/Brand.jsx'
import { Button, Card, ErrorBox } from '../../components/ui/index.jsx'
import { useReward } from '../../context/RewardContext.jsx'
import { API } from '../../lib/api.js'
import { GAME_META } from '../Playground.jsx'
import CylinderQuest from './CylinderQuest.jsx'
import FormulaBuilder from './FormulaBuilder.jsx'
import NetMatcher from './NetMatcher.jsx'
import PartDetector from './PartDetector.jsx'
import RadiusPiSprint from './RadiusPiSprint.jsx'

const GAMES = {
  'part-detector': {
    title: 'Part Detector', component: PartDetector,
    howto: 'Lihat benda nyata, lalu pilih kombinasi bagian permukaan yang dihitung luasnya.',
    rules: ['8 ronde, masing-masing 12 detik', 'Jawaban benar = 10 poin', 'Makin cepat menjawab, makin besar bonus (maks 20)'],
  },
  'radius-pi-sprint': {
    title: 'Radius & Pi Sprint', component: RadiusPiSprint,
    howto: 'Ubah diameter menjadi jari-jari, lalu pilih π yang paling efisien (22/7 atau 3,14).',
    rules: ['Waktu 75 detik', 'Benar r DAN π = 10 poin', 'Skor maksimal 100'],
  },
  'net-matcher': {
    title: 'Net Matcher', component: NetMatcher,
    howto: 'Pilih selimut persegi panjang yang pas menutup tabung, tanpa celah dan tanpa berlebih.',
    rules: ['6 ronde', 'Panjang selimut harus = 2πr, lebar = t', 'Setiap ronde benar ≈ 17 poin'],
  },
  'formula-builder': {
    title: 'Formula Builder Challenge', component: FormulaBuilder,
    howto: 'Ketuk blok untuk mengisi slot Rumus → Substitusi → Hasil secara berurutan. Ketuk slot untuk mengosongkannya.',
    rules: ['4 kasus', 'Setiap slot benar ≈ 8 poin', 'Waspadai blok jebakan!'],
  },
  'cylinder-quest': {
    title: 'Cylinder Quest Adventure', component: CylinderQuest,
    howto: 'Bantu Arsitek Desa membangun tangki air, kemasan produk, dan pilar taman untuk membuka 3 gerbang.',
    rules: ['3 gerbang, masing-masing 2 tantangan', 'Kamu punya 3 nyawa', 'Setiap kesalahan mengurangi skor'],
  },
}

function feedbackFor(score) {
  if (score >= 90) return 'Luar biasa! Kamu sudah sangat menguasai konsep ini.'
  if (score >= 70) return 'Bagus sekali! Sedikit lagi menuju sempurna.'
  if (score >= 40) return 'Lumayan! Coba ulangi dan perhatikan umpan balik di setiap ronde.'
  return 'Tidak apa-apa, belajar butuh latihan. Buka lagi materi terkait, lalu coba lagi!'
}

export default function GamePage() {
  const { slug } = useParams()
  const notify = useReward()
  const game = GAMES[slug]
  const [phase, setPhase] = useState('intro')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!game) return <ErrorBox message="Game tidak ditemukan." />
  const meta = GAME_META[slug]
  const Icon = meta.icon
  const Comp = game.component

  const finish = async (s) => {
    const final = Math.max(0, Math.min(100, Math.round(s)))
    setScore(final)
    setPhase('result')
    setSaving(true)
    setSaveError('')
    try {
      notify(await API.submitGame(slug, final))
    } catch (e) {
      setSaveError(`Skor belum tersimpan: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const start = () => { setRound((r) => r + 1); setPhase('play') }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/playground" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-royal"><ChevronLeft className="size-4" /> Playground</Link>
      <header className="mb-4 flex items-center gap-3">
        <span className={`grid size-12 place-items-center rounded-2xl ${meta.color}`}><Icon className="size-6" /></span>
        <h1 className="text-2xl font-black text-navy">{game.title}</h1>
      </header>

      {phase === 'intro' && (
        <Card className="space-y-4">
          <Companion dismissible={false}>{game.howto}</Companion>
          <div>
            <h2 className="font-extrabold text-navy">Aturan</h2>
            <ul className="mt-1 list-inside list-disc text-slate-700">{game.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          <Button icon={Play} onClick={start} className="w-full sm:w-auto">Mulai Bermain</Button>
        </Card>
      )}

      {phase === 'play' && <Comp key={round} onFinish={finish} />}

      {phase === 'result' && (
        <Card className="pop-in space-y-4 text-center">
          <Trophy className="mx-auto size-14 text-sun" />
          <p className="font-display text-5xl font-black text-navy">{score}<span className="text-2xl text-slate-400">/100</span></p>
          <p className="text-slate-700">{feedbackFor(score)}</p>
          {saving && <p className="text-sm text-slate-500">Menyimpan skor...</p>}
          <ErrorBox message={saveError} onRetry={() => finish(score)} />
          <div className="flex flex-wrap justify-center gap-2">
            <Button icon={RotateCcw} onClick={start}>Main Lagi</Button>
            <Button variant="secondary" to="/playground">Pilih Game Lain</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
