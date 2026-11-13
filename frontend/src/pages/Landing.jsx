import { Link } from 'react-router-dom'
import { BookOpen, Box, Dumbbell, FlaskConical, Gamepad2, Layers, LogIn, Play, Trophy } from 'lucide-react'
import { Companion, Logo } from '../components/Brand.jsx'
import { NetDiagram } from '../components/Diagrams.jsx'
import { Button } from '../components/ui/index.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const LEARN = [
  'Mengingat kembali prasyarat lingkaran: r, d, keliling, dan luas lingkaran.',
  'Mengenali unsur-unsur tabung dan jaring-jaringnya secara 3D.',
  'Menemukan asal rumus luas permukaan tabung tertutup 2πr(r + t).',
  'Menghitung luas tabung tanpa tutup (πr² + 2πrt) dan luas selimut (2πrt).',
  'Menyelesaikan soal literasi matematis dalam kehidupan sehari-hari.',
]

const FEATURES = [
  { icon: Box, title: 'Visualisasi Tabung 3D', text: 'Putar tabung 360° dengan jari atau mouse, buka-tutup bagian tutupnya.' },
  { icon: Layers, title: 'Lab Jaring-Jaring', text: 'Geser slider dan lihat tabung terbentang menjadi 2 lingkaran + 1 persegi panjang.' },
  { icon: BookOpen, title: 'Materi Bertahap Anti-Bingung', text: 'Satu konsep per kartu, gambar dan penjelasan selalu berdampingan.' },
  { icon: Dumbbell, title: 'Latihan dengan Petunjuk', text: 'Salah? Tubi mendeteksi kesalahanmu dan memberi Hint 1, 2, 3.' },
  { icon: Gamepad2, title: '5 Mini Games Edukatif', text: 'Part Detector, Pi Sprint, Net Matcher, Formula Builder, dan Cylinder Quest.' },
  { icon: Trophy, title: 'Evaluasi Literasi', text: '4 soal kontekstual dengan skor bertahap per langkah penyelesaian.' },
]

const HOW = [
  'Masukkan kode siswa dari gurumu.',
  'Masuk ke dashboard petualangan.',
  'Jelajahi wilayah materi dari Level 01 hingga Level 04.',
  'Uji pemahaman di Cylinder Laboratory dan Training Zone.',
  'Mainkan mini games, kumpulkan XP dan lencana.',
  'Selesaikan evaluasi akhir literasi matematis.',
]

function HeroCylinder() {
  return (
    <svg viewBox="0 0 260 240" className="w-full max-w-sm drop-shadow-xl" role="img" aria-label="Ilustrasi tabung 3D dengan ukuran r dan t">
      <defs>
        <linearGradient id="hs" x1="0" x2="1">
          <stop offset="0" stopColor="#3b82f6" /><stop offset=".45" stopColor="#93c5fd" /><stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path d="M50 50v130c0 17 36 30 80 30s80-13 80-30V50" fill="url(#hs)" />
      <path d="M50 180c0 17 36 30 80 30s80-13 80-30" fill="none" stroke="#FB923C" strokeWidth="4" />
      <ellipse cx="130" cy="50" rx="80" ry="28" fill="#FACC15" stroke="#ca8a04" strokeWidth="2" />
      <line x1="130" y1="50" x2="210" y2="50" stroke="#172554" strokeWidth="3" />
      <circle cx="130" cy="50" r="4" fill="#172554" />
      <text x="160" y="44" fontSize="16" fontWeight="800" fill="#172554">r</text>
      <line x1="226" y1="50" x2="226" y2="180" stroke="#F8FAFC" strokeWidth="2.5" strokeDasharray="6 5" />
      <text x="232" y="120" fontSize="16" fontWeight="800" fill="#F8FAFC">t</text>
    </svg>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const start = user ? '/dashboard' : '/login'
  return (
    <div className="min-h-dvh bg-paper">
      <header className="bg-navy">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo dark />
          <Link to={start} className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold text-white hover:bg-white/10">
            <LogIn className="size-5" /> {user ? 'Dashboard' : 'Masuk'}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-navy pb-14 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-6 md:grid-cols-2 md:pt-12">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-sun">Unfold the Cylinder, Master the Surface!</p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">Petualangan Menaklukkan <span className="text-selimut">Dunia Tabung</span></h1>
            <p className="mt-4 max-w-lg text-lg text-blue-100">
              Belajar luas permukaan tabung untuk SMP kelas VIII dengan membentangkan tabung 3D, berlatih bertahap, dan bermain game edukatif. Kamu tidak perlu sekadar menghafal rumus.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={start} variant="sun" icon={Play} className="text-lg">MULAI PETUALANGAN</Button>
              <Button to="/login" variant="secondary" icon={LogIn}>Masuk dengan Kode Siswa</Button>
            </div>
          </div>
          <div className="flex justify-center"><HeroCylinder /></div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-14 px-4 py-12">
        <section className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black text-navy">Tentang Aplikasi</h2>
            <p className="mt-3 text-slate-700">
              Cylinder Odyssey 3D adalah media pembelajaran interaktif berbasis eksplorasi 3D dan permainan edukatif. Kamu akan melihat sendiri mengapa rumus luas permukaan tabung berbentuk <b className="formula">2πr(r + t)</b>, yaitu dari 2 lingkaran dan 1 persegi panjang pada jaring-jaringnya.
            </p>
            <Companion className="mt-5" dismissible={false}>Halo, penjelajah! Aku Tubi. Siap membongkar rahasia luas permukaan tabung bersamaku?</Companion>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><NetDiagram r={7} t={10} /></div>
        </section>

        <section>
          <h2 className="text-2xl font-black text-navy">Apa yang Akan Dipelajari?</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {LEARN.map((l, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-royal font-bold text-white">{i + 1}</span>{l}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-navy">Fitur Unggulan</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <Icon className="size-8 text-royal" />
                <h3 className="mt-2 text-lg font-extrabold text-navy">{title}</h3>
                <p className="text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black text-navy">Cara Menggunakan</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HOW.map((h, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <span className="font-display text-3xl font-black text-sun">{i + 1}</span>{h}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center">
            <Button to={start} variant="primary" icon={FlaskConical} className="text-lg">Mulai Sekarang</Button>
          </div>
        </section>
      </main>
      <footer className="bg-navy py-6 text-center text-sm text-blue-200">Cylinder Odyssey 3D · Media pembelajaran Luas Permukaan Tabung · SMP Kelas VIII</footer>
    </div>
  )
}
