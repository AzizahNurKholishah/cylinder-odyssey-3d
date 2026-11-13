import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardCheck, Send, Trophy } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import Highlighter from '../components/Highlighter.jsx'
import LiteracyBars, { INDICATOR_SHORT } from '../components/LiteracyBars.jsx'
import QuestionSteps from '../components/QuestionSteps.jsx'
import { Button, Card, ErrorBox, PageHeader, Spinner } from '../components/ui/index.jsx'
import { useReward } from '../context/RewardContext.jsx'
import { API } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'

const DRAFT_KEY = 'co3d_final_draft'

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {} } catch { return {} }
}

export function ResultView({ result, questions }) {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-navy">Rangkuman Skor per Indikator</h2>
        <LiteracyBars scores={result.scores} total={result.total_score} indicators={result.indicators} />
      </Card>
      <h2 className="text-lg font-extrabold text-navy">Pembahasan Lengkap</h2>
      {questions.map((q, i) => {
        const d = result.detail[q.id]
        if (!d) return null
        return (
          <Card key={q.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-black text-navy">Soal {i + 1}: {q.title}</h3>
              <span className="rounded-full bg-navy px-3 py-1 text-sm font-bold text-sun">{d.score}/{d.max_score}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-royal">{INDICATOR_SHORT[q.indicator]}</p>
            <QuestionSteps
              steps={q.steps}
              answers={Object.fromEntries(d.steps.map((s) => [s.step_id, s.student_answer]))}
              results={Object.fromEntries(d.steps.map((s) => [s.step_id, s]))}
              onChange={() => {}}
              disabled
              showPoints
            />
            <div className="rounded-xl bg-paper p-3 ring-1 ring-slate-200">
              <p className="text-sm font-bold text-slate-600">Penyelesaian</p>
              <pre className="formula whitespace-pre-wrap text-sm leading-7">{result.explanations?.[q.id]?.explanation}</pre>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default function FinalChallenge() {
  const notify = useReward()
  const { data, loading, error, reload } = useApi(() => Promise.all([API.evaluationQuestions(), API.latestEvaluation()]))
  const [phase, setPhase] = useState('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(loadDraft)
  const [confirm, setConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(answers)) } catch { /* abaikan */ }
  }, [answers])

  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const [{ questions, indicators }, { result: latest }] = data
  const q = questions[current]
  const qAnswers = answers[q.id] || {}
  const answeredCount = (qq) => qq.steps.filter((s) => String(answers[qq.id]?.[s.id] ?? '').trim()).length
  const totalSteps = questions.reduce((n, qq) => n + qq.steps.length, 0)
  const totalAnswered = questions.reduce((n, qq) => n + answeredCount(qq), 0)

  const submit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await API.submitEvaluation(answers)
      setResult(res)
      notify(res)
      setAnswers({})
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* abaikan */ }
      setConfirm(false)
      setPhase('result')
      window.scrollTo(0, 0)
    } catch (e) {
      setSubmitError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'result' && (result || latest)) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader icon={Trophy} eyebrow="Final Challenge" title="Hasil Evaluasi Literasi" subtitle="Skor diberikan per tahap penyelesaian, jadi langkah yang benar tetap dihargai." />
        <Companion className="mb-4" mood="wow">
          {(result || latest).total_score >= 18 ? 'Hebat! Kamu berhasil menaklukkan Puncak Literasi Tabung!' : 'Kerja bagus sudah menyelesaikan evaluasi! Pelajari pembahasannya, terutama di tahap yang belum tepat.'}
        </Companion>
        <ResultView result={result || latest} questions={questions} />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => { setPhase('intro'); setResult(null); reload() }} variant="secondary">Kembali</Button>
          <Button to="/profile">Lihat Profil</Button>
        </div>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <PageHeader icon={Trophy} eyebrow="Final Challenge" title="Evaluasi Akhir Mathematical Literacy" subtitle="4 soal kontekstual, skor maksimal 24. Setiap soal dikerjakan per tahap dan setiap tahap punya poin sendiri." />
        <Card>
          <h2 className="mb-2 font-extrabold text-navy">Yang dinilai</h2>
          <ol className="space-y-2">
            {questions.map((qq, i) => (
              <li key={qq.id} className="flex items-start gap-3 rounded-xl bg-paper p-3 ring-1 ring-slate-200">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy font-bold text-white">{i + 1}</span>
                <div><p className="font-bold">{qq.title}</p><p className="text-sm text-slate-600">{indicators[qq.indicator]} · {qq.steps.length} tahap · maks 6 poin</p></div>
              </li>
            ))}
          </ol>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-700">
            <li>Kunci jawaban tidak ditampilkan selama evaluasi.</li>
            <li>Jawabanmu tersimpan otomatis di perangkat ini sampai kamu mengirimnya.</li>
            <li>Kamu boleh berpindah soal kapan saja sebelum mengirim.</li>
          </ul>
        </Card>
        <Companion>Tips dari Tubi: sorot info penting, cek r atau d, perhatikan tutup, dan jangan lupa satuannya. Semangat!</Companion>
        <div className="flex flex-wrap gap-2">
          <Button icon={ClipboardCheck} onClick={() => setPhase('exam')}>{totalAnswered > 0 ? 'Lanjutkan Evaluasi' : 'Mulai Evaluasi'}</Button>
          {latest && <Button variant="secondary" onClick={() => setPhase('result')}>Lihat Hasil Terakhir ({latest.total_score}/24)</Button>}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 grid grid-cols-4 gap-2" role="tablist" aria-label="Pilih soal">
        {questions.map((qq, i) => {
          const n = answeredCount(qq)
          return (
            <button key={qq.id} role="tab" aria-selected={i === current} onClick={() => setCurrent(i)} className={`rounded-xl p-2 text-center ring-1 ${i === current ? 'bg-navy text-white ring-navy' : 'bg-white ring-slate-200'}`}>
              <p className="font-display text-lg font-black">Soal {i + 1}</p>
              <p className="text-[11px] opacity-80">{n}/{qq.steps.length} tahap</p>
            </button>
          )
        })}
      </div>

      <Card className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-royal">{indicators[q.indicator]}</p>
          <h1 className="text-xl font-black text-navy">Soal {current + 1}: {q.title}</h1>
        </div>
        <Highlighter key={q.id} text={q.story_text} phrases={q.highlights} allowAuto={false} />
        <QuestionSteps
          steps={q.steps}
          answers={qAnswers}
          onChange={(k, v) => setAnswers({ ...answers, [q.id]: { ...qAnswers, [k]: v } })}
          showPoints
        />
      </Card>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="secondary" icon={ChevronLeft} disabled={current === 0} onClick={() => setCurrent(current - 1)}>Sebelumnya</Button>
        {current < questions.length - 1
          ? <Button onClick={() => setCurrent(current + 1)}>Berikutnya <ChevronRight className="size-5" /></Button>
          : <Button variant="success" icon={Send} onClick={() => setConfirm(true)}>Kirim Evaluasi</Button>}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="pop-in w-full max-w-sm rounded-2xl bg-white p-5">
            <h2 id="confirm-title" className="text-lg font-black text-navy">Kirim evaluasi sekarang?</h2>
            <p className="mt-1 text-slate-600">Kamu sudah mengisi {totalAnswered} dari {totalSteps} tahap. {totalAnswered < totalSteps && 'Tahap yang kosong akan bernilai 0.'}</p>
            <ErrorBox message={submitError} />
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setConfirm(false)} className="flex-1">Periksa Lagi</Button>
              <Button variant="success" onClick={submit} loading={submitting} className="flex-1">Ya, Kirim</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
