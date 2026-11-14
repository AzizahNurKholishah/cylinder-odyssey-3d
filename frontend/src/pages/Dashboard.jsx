import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CircleCheck, Circle, Dumbbell, FlaskConical, Gamepad2, History, Map, Play, Sparkles, Target, Trophy } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import { BadgeTile, MiniMap } from '../components/Regions.jsx'
import { Card, ErrorBox, ProgressBar, Spinner } from '../components/ui/index.jsx'
import { API } from '../lib/api.js'
import { timeAgo } from '../lib/time.js'
import { useApi } from '../lib/useApi.js'

const QUICK = [
  { to: '/map', label: 'Peta Petualangan', icon: Map, cls: 'bg-blue-50 text-royal' },
  { to: '/lab', label: 'Cylinder Laboratory', icon: FlaskConical, cls: 'bg-sky-50 text-sky-700' },
  { to: '/training', label: 'Training Zone', icon: Dumbbell, cls: 'bg-orange-50 text-orange-700' },
  { to: '/playground', label: 'Cylinder Playground', icon: Gamepad2, cls: 'bg-violet-50 text-violet-700' },
  { to: '/final', label: 'Final Challenge', icon: Trophy, cls: 'bg-yellow-50 text-yellow-800' },
]

export default function Dashboard() {
  const { data, loading, error, reload } = useApi(() => API.dashboard())
  const navigate = useNavigate()
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={reload} />

  const { profile, stats, progress_percent, missions, lessons, badges, recent_activities, recommendation } = data
  const levelSpan = (stats.next_level_at ?? stats.xp) - stats.level_start
  const firstName = profile.full_name || profile.student_code
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl bg-navy p-5 text-white sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-200">{profile.student_code !== profile.full_name && `${profile.student_code} · `}Kelas {profile.class_name}</p>
            <h1 className="text-2xl font-black sm:text-3xl">Halo, {firstName}! 👋</h1>
            <p className="mt-1 text-blue-100">Level {stats.level} · <span className="font-semibold text-sun">{stats.title}</span></p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
            <p className="flex items-center justify-end gap-1 font-display text-3xl font-black text-sun"><Sparkles className="size-6" />{stats.xp}</p>
            <p className="text-xs text-blue-200">Total XP</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex justify-between text-sm"><span>Progres belajar</span><b>{progress_percent}%</b></div>
            <ProgressBar value={progress_percent} label="Progres belajar" />
            <p className="mt-1 text-xs text-blue-200">{stats.missions_completed} dari {stats.missions_total} misi selesai</p>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm"><span>Menuju level berikutnya</span><b>{stats.next_level_at ? `${stats.xp}/${stats.next_level_at} XP` : 'Level maksimal!'}</b></div>
            <ProgressBar value={stats.next_level_at ? stats.xp - stats.level_start : 1} max={stats.next_level_at ? levelSpan : 1} color="bg-sun" label="XP level" />
          </div>
        </div>
        <Link to={recommendation.route} className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-sun px-4 py-3 font-bold text-navy hover:bg-yellow-300">
          <span className="flex items-center gap-2"><Play className="size-5" /> Lanjutkan Belajar: {recommendation.title}</span>
          <ArrowRight className="size-5 shrink-0" />
        </Link>
      </section>

      <Companion>
        {progress_percent === 0
          ? 'Selamat datang! Mulai dari Level 01 Lembah Lingkaran dulu, ya. Kita ingat lagi jari-jari dan diameter sebelum masuk ke tabung.'
          : progress_percent === 100
            ? 'Luar biasa! Semua misi sudah kamu taklukkan. Coba ulangi Final Challenge untuk skor terbaikmu!'
            : `Kerja bagus! Misi berikutnya: ${recommendation.title}.`}
      </Companion>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-navy">Peta Perjalanan</h2>
            <Link to="/map" className="text-sm font-semibold text-royal">Buka peta →</Link>
          </div>
          <MiniMap lessons={lessons} onSelect={(l) => navigate(`/lesson/${l.slug}`)} />
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-navy"><Target className="size-5 text-royal" /> Daftar Misi</h2>
          <ul className="space-y-1.5">
            {missions.map((m) => (
              <li key={m.code}>
                <Link to={m.route} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                  {m.done ? <CircleCheck className="size-5 shrink-0 text-emerald-500" /> : <Circle className="size-5 shrink-0 text-slate-300" />}
                  <span className={m.done ? 'text-slate-500 line-through' : 'text-ink'}>{m.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-extrabold text-navy">Navigasi Cepat</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK.map(({ to, label, icon: Icon, cls }) => (
            <Link key={to} to={to} className={`flex min-h-24 flex-col items-start justify-between rounded-2xl p-4 font-bold ring-1 ring-slate-200 transition-shadow hover:shadow-md ${cls}`}>
              <Icon className="size-7" /> {label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-navy">Koleksi Lencana ({badges.filter((b) => b.unlocked).length}/{badges.length})</h2>
          <div className="grid gap-2 sm:grid-cols-2">{badges.map((b) => <BadgeTile key={b.code} badge={b} compact />)}</div>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-navy"><History className="size-5 text-royal" /> Aktivitas Terakhir</h2>
          {recent_activities.length === 0 ? (
            <p className="text-slate-500">Belum ada aktivitas. Ayo mulai misi pertamamu!</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent_activities.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div><p className="font-medium text-ink">{a.title}</p><p className="text-xs text-slate-500">{timeAgo(a.created_at)}</p></div>
                  {a.xp > 0 && <span className="shrink-0 rounded-full bg-mint/40 px-2 py-0.5 text-xs font-bold text-emerald-800">+{a.xp} XP</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
