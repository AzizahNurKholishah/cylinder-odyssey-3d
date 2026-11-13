import { Link } from 'react-router-dom'
import { Blocks, Gamepad2, Puzzle, Scan, Swords, Timer } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import { ErrorBox, PageHeader, Spinner } from '../components/ui/index.jsx'
import { API } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'

export const GAME_META = {
  'part-detector': { icon: Scan, color: 'bg-sun text-navy', skill: 'Unsur & jenis tabung' },
  'radius-pi-sprint': { icon: Timer, color: 'bg-alas text-navy', skill: 'r = d ÷ 2 & pilihan π' },
  'net-matcher': { icon: Puzzle, color: 'bg-selimut text-navy', skill: 'Ukuran jaring-jaring' },
  'formula-builder': { icon: Blocks, color: 'bg-lilac text-navy', skill: 'Rumus & substitusi' },
  'cylinder-quest': { icon: Swords, color: 'bg-mint text-navy', skill: 'Soal kontekstual' },
}

export default function Playground() {
  const { data, loading, error, reload } = useApi(() => API.games())
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const played = data.games.filter((g) => g.plays > 0).length
  return (
    <div>
      <PageHeader icon={Gamepad2} eyebrow="Cylinder Playground" title="Taman Bermain Tabung" subtitle={`5 mini games dengan mekanisme berbeda. Kamu sudah memainkan ${played} dari 5 game.`} />
      <Companion className="mb-5">Mainkan kelima game untuk mendapat lencana Playground Explorer! Skor 70 ke atas memberi bonus XP.</Companion>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.games.map((g, i) => {
          const m = GAME_META[g.slug]
          const Icon = m.icon
          return (
            <Link key={g.slug} to={`/playground/${g.slug}`} className="group flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between">
                <span className={`grid size-14 place-items-center rounded-2xl ${m.color}`}><Icon className="size-7" /></span>
                <span className="text-xs font-bold text-slate-400">GAME {i + 1}</span>
              </div>
              <h2 className="mt-3 text-lg font-black text-navy">{g.title}</h2>
              <p className="flex-1 text-sm text-slate-600">{g.description}</p>
              <p className="mt-2 text-xs font-semibold text-royal">Melatih: {m.skill}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">{g.plays > 0 ? `${g.plays}× dimainkan` : 'Belum dimainkan'}</span>
                <span className="font-bold text-navy">{g.best_score !== null ? `Terbaik: ${g.best_score}` : '–'}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
