import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, CircleCheck, Dumbbell } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import { ErrorBox, PageHeader, ProgressBar, Spinner } from '../components/ui/index.jsx'
import { API } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'

export const LEVELS = {
  1: { name: 'Beginner', desc: 'Prasyarat lingkaran (r vs d), unsur tabung, luas selimut dasar', cls: 'bg-mint/30 text-emerald-800' },
  2: { name: 'Intermediate', desc: 'Tabung tertutup & tanpa tutup, π = 22/7 maupun 3,14', cls: 'bg-blue-100 text-blue-800' },
  3: { name: 'Expert', desc: 'Soal cerita literasi multi-langkah', cls: 'bg-lilac/30 text-violet-800' },
}

export const TYPE_NAMES = {
  multiple_choice: 'Pilihan ganda',
  true_false: 'Benar / Salah',
  numeric_steps: 'Isian berlangkah',
  identify_parts: 'Identifikasi bagian',
  story: 'Soal cerita + highlighter',
}

const CYL = { closed: 'Tertutup', open: 'Tanpa tutup', blanket: 'Selimut' }

export default function Training() {
  const { data, loading, error, reload } = useApi(() => API.practiceList())
  const [level, setLevel] = useState(1)
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const qs = data.questions
  const solved = qs.filter((q) => q.solved).length
  const list = qs.filter((q) => q.difficulty === level)

  return (
    <div>
      <PageHeader icon={Dumbbell} eyebrow="Training Zone" title="Latihan Bertahap" subtitle="Kerjakan dari Beginner. Kalau salah, Tubi akan memberi petunjuk bertingkat, bukan sekadar “salah”." />
      <div className="mb-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">Soal terselesaikan</span><b>{solved}/{qs.length}</b></div>
        <ProgressBar value={solved} max={qs.length} label="Soal terselesaikan" />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2" role="tablist">
        {[1, 2, 3].map((lv) => {
          const n = qs.filter((q) => q.difficulty === lv)
          return (
            <button key={lv} role="tab" aria-selected={level === lv} onClick={() => setLevel(lv)} className={`rounded-xl p-2 text-left ring-1 sm:p-3 ${level === lv ? 'bg-navy text-white ring-navy' : 'bg-white ring-slate-200'}`}>
              <p className="text-xs font-bold opacity-70">Level {lv}</p>
              <p className="font-display font-black">{LEVELS[lv].name}</p>
              <p className="text-xs opacity-80">{n.filter((q) => q.solved).length}/{n.length} selesai</p>
            </button>
          )
        })}
      </div>
      <Companion className="mb-4" dismissible>
        {level === 1 && 'Mulai dari dasar dulu: r atau d, unsur tabung, dan luas selimut.'}
        {level === 2 && 'Di sini tabung tertutup dan tanpa tutup dipisah. Baca kata kuncinya baik-baik!'}
        {level === 3 && 'Soal cerita panjang? Pakai fitur sorot (highlighter) untuk menandai info penting.'}
      </Companion>

      <p className="mb-3 text-sm text-slate-600">{LEVELS[level].desc}</p>
      <ul className="space-y-2">
        {list.map((q, i) => (
          <li key={q.id}>
            <Link to={`/training/${q.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition-shadow hover:shadow-md">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl font-black ${q.solved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {q.solved ? <CircleCheck className="size-5" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{q.title}</p>
                <p className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${LEVELS[q.difficulty].cls}`}>{TYPE_NAMES[q.question_type]}</span>
                  {q.cylinder_type && <span className="rounded-full bg-slate-100 px-2 py-0.5">{CYL[q.cylinder_type]}</span>}
                  {q.attempts > 0 && <span>{q.attempts}× mencoba</span>}
                </p>
              </div>
              <ChevronRight className="size-5 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
