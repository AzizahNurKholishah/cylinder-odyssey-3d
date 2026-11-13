import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CircleCheck, Flag, Lock, RotateCcw, Target, TriangleAlert } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import { LessonVisual } from '../components/lesson/Visuals.jsx'
import { Button, ErrorBox, Feedback, Spinner } from '../components/ui/index.jsx'
import { LESSON_CONTENT } from '../content/lessons.js'
import { useReward } from '../context/RewardContext.jsx'
import { API } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'

function QuickCheck({ check, solved, onSolved }) {
  const [picked, setPicked] = useState(null)
  const opt = picked !== null ? check.options[picked] : null
  return (
    <div className="rounded-xl bg-blue-50/60 p-3 ring-1 ring-blue-200">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-royal"><Target className="size-4" /> Quick Check {solved && <CircleCheck className="size-4 text-emerald-600" />}</p>
      <p className="mb-2 font-semibold">{check.q}</p>
      <div className="grid gap-2">
        {check.options.map((o, i) => (
          <button
            key={i}
            onClick={() => { setPicked(i); if (o.ok) onSolved() }}
            className={`min-h-11 rounded-lg px-3 py-2 text-left text-sm font-medium ring-1 ${picked === i ? (o.ok ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-amber-500 text-white ring-amber-500') : 'bg-white ring-slate-300 hover:bg-blue-50'}`}
          >
            {o.t}
          </button>
        ))}
      </div>
      {opt && <div className="mt-2"><Feedback ok={opt.ok}>{opt.fb}{opt.ok && <span className="mt-1 block text-xs text-emerald-800">Refleksi: mengapa jawaban ini benar? Coba jelaskan dengan kalimatmu sendiri.</span>}</Feedback></div>}
    </div>
  )
}

export default function Lesson() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const notify = useReward()
  const content = LESSON_CONTENT[slug]
  const status = useApi(() => API.lessons(), [slug])
  const storeKey = `co3d_lesson_${slug}`
  const [step, setStep] = useState(() => {
    try { return Number(localStorage.getItem(storeKey)) || 0 } catch { return 0 }
  })
  const [resetKey, setResetKey] = useState(0)
  const [solved, setSolved] = useState(() => new Set())
  const [activities, setActivities] = useState(() => new Set())
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState('')

  const total = content ? content.steps.length + 1 : 0 // + kartu rangkuman
  useEffect(() => { try { localStorage.setItem(storeKey, String(step)) } catch { /* abaikan */ } }, [step, storeKey])

  const markActivity = useCallback((i) => setActivities((prev) => (prev.has(i) ? prev : new Set(prev).add(i))), [])
  const markSolved = useCallback((i) => setSolved((prev) => (prev.has(i) ? prev : new Set(prev).add(i))), [])

  if (!content) return <ErrorBox message="Level tidak ditemukan." />
  if (status.loading) return <Spinner />
  if (status.error) return <ErrorBox message={status.error} onRetry={status.reload} />
  const lesson = status.data.lessons.find((l) => l.slug === slug)
  if (!lesson?.is_unlocked) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <Lock className="mx-auto size-12 text-slate-400" />
        <h1 className="mt-3 text-xl font-black text-navy">Wilayah ini masih terkunci</h1>
        <p className="mt-1 text-slate-600">Selesaikan level sebelumnya terlebih dahulu.</p>
        <Button to="/map" className="mt-4">Kembali ke Peta</Button>
      </div>
    )
  }

  const current = Math.min(step, total - 1)
  const isSummary = current === content.steps.length
  const s = content.steps[current]
  const requiredChecks = content.steps.map((x, i) => (x.check ? i : null)).filter((x) => x !== null)
  const requiredActs = content.steps.map((x, i) => (x.visual?.required ? i : null)).filter((x) => x !== null)
  const pending = [
    ...requiredChecks.filter((i) => !solved.has(i)).map((i) => `Quick check kartu ${i + 1}`),
    ...requiredActs.filter((i) => !activities.has(i)).map((i) => `Aktivitas kartu ${i + 1}`),
  ]

  const finish = async () => {
    setFinishing(true)
    setFinishError('')
    try {
      const res = await API.completeLesson(slug)
      notify(res)
      try { localStorage.removeItem(storeKey) } catch { /* abaikan */ }
      navigate('/map')
    } catch (e) {
      setFinishError(e.message)
    } finally {
      setFinishing(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link to="/map" className="flex items-center gap-1 text-sm font-semibold text-royal"><ChevronLeft className="size-4" /> Peta</Link>
        {lesson.is_completed && <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700"><CircleCheck className="size-3.5" /> Misi selesai, mode ulang</span>}
      </div>
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-royal">Level 0{content.level}</p>
        <h1 className="text-2xl font-black text-navy sm:text-3xl">{content.title}</h1>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600"><Target className="mt-0.5 size-4 shrink-0 text-royal" /> <span><b>Tujuan:</b> {content.goal}</span></p>
      </header>

      {/* indikator langkah */}
      <div className="mb-4 flex items-center gap-1.5" aria-label={`Kartu ${current + 1} dari ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <button key={i} onClick={() => setStep(i)} aria-label={`Ke kartu ${i + 1}`} className={`h-2.5 flex-1 rounded-full transition-colors ${i === current ? 'bg-royal' : i < current ? 'bg-selimut' : 'bg-slate-200'}`} />
        ))}
      </div>

      {current === 0 && <Companion className="mb-4">{content.intro}</Companion>}

      <article key={`${current}-${resetKey}`} className="fade-in rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        {!isSummary ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="order-1">
              <LessonVisual visual={s.visual} story={content.story} onDone={() => markActivity(current)} />
            </div>
            <div className="order-2 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400">Kartu {current + 1}/{total}</p>
                <h2 className="text-xl font-black text-navy">{s.title}</h2>
                <p className="mt-2 text-[1.05rem]">{s.text}</p>
              </div>
              {s.formula && <p className="formula rounded-xl bg-navy px-4 py-3 text-center text-lg font-bold text-sun">{s.formula}</p>}
              {s.example && (
                <div className="rounded-xl bg-paper p-3 ring-1 ring-slate-200">
                  <p className="text-sm font-bold text-slate-600">{s.example.title}</p>
                  {s.example.lines.map((l, i) => <p key={i} className="formula">{l}</p>)}
                </div>
              )}
              {s.tip && <Companion mood="think">{s.tip}</Companion>}
              {s.visual?.required && (
                <p className={`text-sm font-semibold ${activities.has(current) ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {activities.has(current) ? '✓ Aktivitas selesai' : '○ Selesaikan aktivitas di kartu ini'}
                </p>
              )}
              {s.check && <QuickCheck check={s.check} solved={solved.has(current)} onSolved={() => markSolved(current)} />}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-black text-navy">Rangkuman Poin Kunci</h2>
              <ul className="mt-3 space-y-2">
                {content.summary.map((x, i) => <li key={i} className="flex gap-2 rounded-lg bg-mint/20 p-2.5"><CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" /><span className="formula text-sm sm:text-base">{x}</span></li>)}
              </ul>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-navy"><TriangleAlert className="size-5 text-amber-500" /> Awas Jebakan!</h2>
              <ul className="mt-3 space-y-2">
                {content.traps.map((x, i) => <li key={i} className="rounded-lg bg-amber-50 p-2.5 text-amber-900 ring-1 ring-amber-200">{x}</li>)}
              </ul>
              <div className="mt-5 space-y-3">
                {pending.length > 0 && !lesson.is_completed ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                    <p className="font-semibold">Sebelum menyelesaikan misi, tuntaskan dulu:</p>
                    <ul className="mt-1 list-inside list-disc text-slate-600">{pending.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                ) : null}
                <ErrorBox message={finishError} />
                <Button variant="success" icon={Flag} onClick={finish} loading={finishing} disabled={pending.length > 0 && !lesson.is_completed} className="w-full">
                  {lesson.is_completed ? 'Selesai Mengulang' : 'Selesaikan Misi (+50 XP)'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </article>

      <nav className="sticky bottom-20 z-20 mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-slate-200 backdrop-blur lg:bottom-4" aria-label="Navigasi kartu">
        <Button variant="secondary" icon={ChevronLeft} onClick={() => setStep(Math.max(0, current - 1))} disabled={current === 0}>Sebelumnya</Button>
        <Button variant="secondary" icon={RotateCcw} onClick={() => setResetKey((k) => k + 1)}>Ulangi</Button>
        <Button onClick={() => setStep(Math.min(total - 1, current + 1))} disabled={current === total - 1}>Lanjut <ChevronRight className="size-5" /></Button>
      </nav>
    </div>
  )
}
