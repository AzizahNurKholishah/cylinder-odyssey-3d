import { Link } from 'react-router-dom'
import { CircleCheck, Lock, Map, Play, RotateCcw } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import { REGION_STYLE } from '../components/Regions.jsx'
import { ErrorBox, PageHeader, Spinner } from '../components/ui/index.jsx'
import { LESSON_CONTENT } from '../content/lessons.js'
import { API } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'

export default function AdventureMap() {
  const { data, loading, error, reload } = useApi(() => API.lessons())
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const lessons = data.lessons
  const done = lessons.filter((l) => l.is_completed).length

  return (
    <div>
      <PageHeader icon={Map} eyebrow="Adventure Map" title="Peta Petualangan Dunia Tabung" subtitle={`${done} dari 4 wilayah sudah ditaklukkan. Wilayah terbuka berurutan, tetapi yang sudah terbuka boleh diulang kapan saja.`} />
      <Companion className="mb-6">Ikuti jalurnya dari bawah ke atas. Setiap wilayah membuka wilayah berikutnya. Santai saja, kamu yang mengatur kecepatan belajarmu!</Companion>

      <ol className="relative mx-auto max-w-2xl space-y-5 before:absolute before:bottom-8 before:left-8 before:top-8 before:w-1 before:rounded before:bg-slate-200 sm:before:left-10">
        {lessons.map((l) => {
          const st = REGION_STYLE[l.slug]
          const Icon = st.icon
          const content = LESSON_CONTENT[l.slug]
          return (
            <li key={l.slug} className="relative flex gap-4">
              <span className={`relative z-10 grid size-16 shrink-0 place-items-center rounded-2xl ring-4 ring-paper sm:size-20 ${l.is_unlocked ? `${st.bg} ${st.text}` : 'bg-slate-200 text-slate-400'}`}>
                {l.is_unlocked ? <Icon className="size-8" /> : <Lock className="size-7" />}
              </span>
              <div className={`flex-1 rounded-2xl p-4 ring-1 ${l.is_unlocked ? 'bg-white ring-slate-200' : 'bg-slate-50 ring-slate-200'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-royal">Level 0{l.level_number}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{st.tag}</span>
                  {l.is_completed && <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"><CircleCheck className="size-3.5" /> Selesai</span>}
                </div>
                <h2 className={`mt-1 text-xl font-black ${l.is_unlocked ? 'text-navy' : 'text-slate-500'}`}>{l.title}</h2>
                <p className="text-sm text-slate-600">{l.description}</p>
                {content && <p className="mt-1 text-xs text-slate-500">{content.steps.length} kartu langkah · aktivitas: {content.activity}</p>}
                <div className="mt-3">
                  {l.is_unlocked ? (
                    <Link to={`/lesson/${l.slug}`} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 font-semibold ${l.is_completed ? 'bg-white text-royal ring-1 ring-royal' : 'bg-royal text-white hover:bg-blue-700'}`}>
                      {l.is_completed ? <><RotateCcw className="size-4" /> Ulangi Materi</> : <><Play className="size-4" /> Mulai Misi</>}
                    </Link>
                  ) : (
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-500"><Lock className="size-4" /> Selesaikan Level 0{l.level_number - 1} untuk membuka</p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
