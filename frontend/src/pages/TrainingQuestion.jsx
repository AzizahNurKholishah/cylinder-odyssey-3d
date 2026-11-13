import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import { ObjectIcon } from '../components/Diagrams.jsx'
import Highlighter from '../components/Highlighter.jsx'
import QuestionSteps, { HintPanel, localStepError } from '../components/QuestionSteps.jsx'
import { Button, Card, ErrorBox, Feedback, Spinner } from '../components/ui/index.jsx'
import { useReward } from '../context/RewardContext.jsx'
import { API } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { LEVELS, TYPE_NAMES } from './Training.jsx'

const ERROR_TUBI = {
  diameter_as_radius: 'Perhatikan baik-baik: yang diketahui diameter atau jari-jari? Jangan lupa r = d ÷ 2!',
  closed_instead_of_open: 'Hati-hati! Benda ini tidak punya tutup. Bagian mana saja yang perlu dihitung luasnya?',
  open_instead_of_closed: 'Benda ini tertutup rapat. Ada berapa lingkaran yang harus dihitung?',
  blanket_only: 'Kamu baru menghitung selimutnya. Coba buka jaring-jaringnya di kepalamu: ada lingkarannya juga?',
  wrong_pi: 'Cek lagi nilai π yang diminta soal: 22/7 atau 3,14?',
  missing_quantity: 'Bendanya ada berapa? Jangan berhenti di satu benda!',
  rounding_down: 'Kalau dibulatkan ke bawah, bahannya kurang. Bulatkan ke atas, ya!',
}

export default function TrainingQuestion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useReward()
  const { data, loading, error, reload } = useApi(() => Promise.all([API.practiceQuestion(id), API.practiceList()]), [id])
  const [answers, setAnswers] = useState({})
  const [hints, setHints] = useState(0)
  const [result, setResult] = useState(null)
  const [showErrors, setShowErrors] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [reflection, setReflection] = useState('')
  const [reflectionSaved, setReflectionSaved] = useState(false)

  useEffect(() => {
    setAnswers({}); setHints(0); setResult(null); setShowErrors(false); setReflection(''); setReflectionSaved(false); setSubmitError('')
  }, [id])

  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const [{ question: q }, { questions: all }] = data
  const idx = all.findIndex((x) => x.id === id)
  const next = all[idx + 1]
  const solved = result?.is_correct
  const revealed = Boolean(result?.explanation)

  const submit = async (reveal = false) => {
    setSubmitError('')
    if (!reveal && q.steps.some((s) => localStepError(s, answers[s.id]))) { setShowErrors(true); return }
    setBusy(true)
    try {
      const res = await API.practiceAttempt(id, { answers, hints_used: hints, reveal })
      setResult(res)
      notify(res)
    } catch (e) {
      setSubmitError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const stepResults = result
    ? Object.fromEntries(result.step_results.map((r) => [r.step_id, { ...r, correct_answer: result.correct_answers?.[r.step_id] }]))
    : null
  const visual = q.steps.find((s) => s.visual)?.visual

  const saveReflection = async () => {
    if (!reflection.trim()) return
    try {
      await API.saveReflection(result.attempt_id, reflection.trim())
      setReflectionSaved(true)
    } catch (e) {
      setSubmitError(e.message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/training" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-royal"><ChevronLeft className="size-4" /> Training Zone</Link>
      <div className="mb-2 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-0.5 font-bold ${LEVELS[q.difficulty].cls}`}>Level {q.difficulty} · {LEVELS[q.difficulty].name}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600">{TYPE_NAMES[q.question_type]}</span>
      </div>
      <h1 className="mb-4 text-2xl font-black text-navy">{q.title}</h1>

      <Card className="space-y-4">
        {q.question_type === 'story'
          ? <Highlighter text={q.story_text} phrases={q.highlights} />
          : (
            <div className="flex items-center gap-4">
              {visual && <ObjectIcon kind={visual} className="size-20 shrink-0" />}
              <p className="text-[1.05rem]">{q.story_text}</p>
            </div>
          )}

        <QuestionSteps steps={q.steps} answers={answers} onChange={(k, v) => setAnswers({ ...answers, [k]: v })} results={stepResults} disabled={solved || revealed} showErrors={showErrors} />

        <ErrorBox message={submitError} />

        {!solved && !revealed && (
          <div className="flex flex-wrap gap-2">
            <Button icon={Send} onClick={() => submit(false)} loading={busy}>Periksa Jawaban</Button>
            {hints >= 3 && result && !result.is_correct && (
              <Button variant="secondary" icon={BookOpen} onClick={() => submit(true)} loading={busy}>Lihat Pembahasan</Button>
            )}
          </div>
        )}
      </Card>

      {result && !solved && !revealed && (
        <div className="mt-4 space-y-3">
          <Companion mood="think">
            {ERROR_TUBI[result.error_type] || 'Belum tepat, tapi tidak apa-apa! Lihat catatan di setiap langkah, lalu buka petunjuk berikutnya.'}
            {hints < 3 && <span className="mt-1 block text-sm text-violet-800">Buka Hint {hints + 1} di bawah jika butuh bantuan.</span>}
            {hints >= 3 && <span className="mt-1 block text-sm text-violet-800">Semua petunjuk sudah terbuka. Coba sekali lagi atau lihat pembahasan.</span>}
          </Companion>
        </div>
      )}

      {!solved && !revealed && (
        <div className="mt-4"><HintPanel hints={q.hints} shown={hints} onShowNext={() => setHints((h) => Math.min(3, h + 1))} /></div>
      )}

      {(solved || revealed) && (
        <div className="mt-4 space-y-4">
          {solved
            ? <Feedback ok>Hebat! Jawabanmu tepat{hints === 0 ? ' tanpa petunjuk' : ''}. {result.xp_awarded > 0 ? `+${result.xp_awarded} XP` : '(XP soal ini sudah pernah kamu dapatkan)'}</Feedback>
            : <Feedback>Ini pembahasannya. Pelajari langkahnya, lalu coba soal berikutnya!</Feedback>}
          <Card>
            <h2 className="mb-2 font-extrabold text-navy">Pembahasan Lengkap</h2>
            <pre className="formula whitespace-pre-wrap text-sm leading-7 text-ink">{result.explanation}</pre>
          </Card>
          {solved && (
            <Card>
              <Companion dismissible={false} title="Refleksi">Mengapa kamu memilih rumus atau cara tersebut?</Companion>
              <textarea value={reflection} onChange={(e) => { setReflection(e.target.value); setReflectionSaved(false) }} rows={3} maxLength={1000} className="mt-3 w-full rounded-lg border border-slate-300 p-3" placeholder="Contoh: karena gelasnya tanpa tutup, jadi lingkarannya hanya satu..." />
              <div className="mt-2 flex items-center gap-3">
                <Button variant="secondary" onClick={saveReflection} disabled={!reflection.trim() || reflectionSaved}>{reflectionSaved ? 'Tersimpan ✓' : 'Simpan Refleksi'}</Button>
              </div>
            </Card>
          )}
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="secondary" to="/training" icon={ChevronLeft}>Daftar Soal</Button>
            {next && <Button onClick={() => navigate(`/training/${next.id}`)}>Soal Berikutnya <ChevronRight className="size-5" /></Button>}
          </div>
        </div>
      )}
    </div>
  )
}
