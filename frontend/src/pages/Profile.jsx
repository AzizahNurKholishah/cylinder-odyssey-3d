import { ChartColumn, Gamepad2, History, Lightbulb, Sparkles, User } from 'lucide-react'
import LiteracyBars from '../components/LiteracyBars.jsx'
import { BadgeTile } from '../components/Regions.jsx'
import { Button, Card, ErrorBox, PageHeader, ProgressBar, Spinner } from '../components/ui/index.jsx'
import { API } from '../lib/api.js'
import { timeAgo } from '../lib/time.js'
import { useApi } from '../lib/useApi.js'

const TYPE_LABEL = { lesson: 'Materi', practice: 'Latihan', game: 'Game', lab: 'Lab 3D', evaluation: 'Evaluasi' }

export default function Profile() {
  const { data, loading, error, reload } = useApi(() => API.profile())
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const { profile, stats, badges, best_evaluation: best, evaluations, practice_summary: ps, game_summary: gs, history, indicators, progress_percent } = data
  const latest = evaluations[0]

  return (
    <div className="space-y-5">
      <PageHeader icon={User} eyebrow="Profil Penjelajah" title={profile.full_name || profile.student_code} subtitle={`${profile.student_code} · Kelas ${profile.class_name}`} />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Total XP', stats.xp, Sparkles],
          ['Level', `${stats.level} · ${stats.title}`, ChartColumn],
          ['Misi selesai', `${stats.missions_completed}/${stats.missions_total}`, History],
          ['Lencana', `${badges.filter((b) => b.unlocked).length}/${badges.length}`, Gamepad2],
        ].map(([label, value, Icon]) => (
          <Card key={label} className="!p-4">
            <Icon className="size-5 text-royal" />
            <p className="mt-1 text-xs text-slate-500">{label}</p>
            <p className="font-display text-lg font-black text-navy">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="!p-4">
        <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">Progres keseluruhan</span><b>{progress_percent}%</b></div>
        <ProgressBar value={progress_percent} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-navy">Capaian Mathematical Literacy</h2>
          {latest ? (
            <>
              <LiteracyBars scores={latest.scores} total={latest.total_score} indicators={indicators} />
              <p className="mt-2 text-xs text-slate-500">Hasil terakhir · {timeAgo(latest.completed_at)}{best && evaluations.length > 1 ? ` · Skor terbaik: ${best.total_score}/24 (${evaluations.length}× evaluasi)` : ''}</p>
            </>
          ) : (
            <div className="text-slate-600">
              <p>Kamu belum mengerjakan Final Challenge.</p>
              <Button to="/final" className="mt-3">Mulai Final Challenge</Button>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-navy">Ringkasan Latihan & Game</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-paper p-3"><dt className="text-slate-500">Percobaan latihan</dt><dd className="text-xl font-black">{ps.attempts}</dd></div>
            <div className="rounded-xl bg-paper p-3"><dt className="text-slate-500">Soal benar</dt><dd className="text-xl font-black">{ps.questions_correct}</dd></div>
            <div className="rounded-xl bg-paper p-3"><dt className="flex items-center gap-1 text-slate-500"><Lightbulb className="size-4" /> Petunjuk dipakai</dt><dd className="text-xl font-black">{ps.hints_used_total}</dd></div>
            <div className="rounded-xl bg-paper p-3"><dt className="text-slate-500">Benar tanpa petunjuk</dt><dd className="text-xl font-black">{ps.hint_free_correct}</dd></div>
          </dl>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {Object.entries(gs).map(([slug, g]) => (
              <li key={slug} className="flex justify-between py-1.5"><span>{g.title}</span><span className="font-semibold">{g.best !== null ? `terbaik ${g.best} · ${g.plays}×` : 'belum dimainkan'}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-navy">Lencana</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{badges.map((b) => <BadgeTile key={b.code} badge={b} />)}</div>
      </Card>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-navy"><History className="size-5 text-royal" /> Riwayat Belajar</h2>
        {history.length === 0 ? <p className="text-slate-500">Belum ada riwayat.</p> : (
          <ul className="divide-y divide-slate-100">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{TYPE_LABEL[h.type] || h.type}</span>
                  <span className="font-medium">{h.title}</span>
                  <p className="text-xs text-slate-500">{timeAgo(h.created_at)}</p>
                </div>
                {h.xp > 0 && <span className="shrink-0 rounded-full bg-mint/40 px-2 py-0.5 text-xs font-bold text-emerald-800">+{h.xp} XP</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
