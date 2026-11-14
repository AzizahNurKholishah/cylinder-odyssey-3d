import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, GraduationCap, KeyRound } from 'lucide-react'
import { Logo, Tubi } from '../components/Brand.jsx'
import { Button, ErrorBox } from '../components/ui/index.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { IS_STANDALONE } from '../lib/api.js'
import { NAME_MAX, validateName } from '../lib/engine/localApi.js'

const CODE_RE = /^[A-Z0-9]{2,8}-[A-Z0-9]{1,6}$/
const inputCls = 'mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg focus:border-royal focus:outline-none'

export default function Login() {
  const { user, login, loginStudent } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('student') // 'student' | 'teacher'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [needKey, setNeedKey] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={user.role === 'teacher' ? '/admin' : '/dashboard'} replace />

  const goHome = (profile) => {
    const home = profile.role === 'teacher' ? '/admin' : '/dashboard'
    const from = location.state?.from
    // kembali ke halaman yang diminta hanya jika cocok dengan peran
    navigate(from && (profile.role === 'teacher') === from.startsWith('/admin') ? from : home, { replace: true })
  }

  const run = async (fn) => {
    setError('')
    setLoading(true)
    try {
      await fn()
    } catch (err) {
      if (err.code === 'access_key_required') {
        setNeedKey(true)
        setError('Masukkan access key guru untuk melanjutkan.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const submitStudent = (e) => {
    e.preventDefault()
    if (IS_STANDALONE) {
      const invalid = validateName(name)
      if (invalid) return setError(invalid.message)
      return run(async () => goHome((await loginStudent(name)).profile))
    }
    // mode server: siswa memakai kode dari guru
    const c = code.trim().toUpperCase().replace(/\s/g, '')
    if (!c) return setError('Kode siswa belum diisi.')
    if (!CODE_RE.test(c)) return setError('Format kode tidak valid. Contoh: SMP8-01.')
    return run(async () => goHome(await login(c, needKey ? accessKey : undefined)))
  }

  const submitTeacher = (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase().replace(/\s/g, '')
    if (!c) return setError('Kode guru belum diisi.')
    if (!CODE_RE.test(c)) return setError('Format kode tidak valid. Contoh: GURU-01.')
    if (!accessKey) return setError('Access key guru belum diisi.')
    return run(async () => goHome(await login(c, accessKey)))
  }

  const switchMode = (m) => { setMode(m); setError(''); setNeedKey(false); setCode(''); setAccessKey('') }

  return (
    <div className="grid min-h-dvh place-items-center bg-navy px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link to="/"><Logo dark /></Link></div>

        {mode === 'student' ? (
          <form onSubmit={submitStudent} className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8" noValidate>
            <div className="flex flex-col items-center text-center">
              <Tubi className="size-20" />
              <h1 className="mt-2 text-2xl font-black text-navy">Selamat Datang, Penjelajah!</h1>
              <p className="mt-1 text-slate-600">
                {IS_STANDALONE ? 'Tulis namamu untuk memulai petualangan.' : 'Masukkan kode siswa dari gurumu untuk memulai petualangan.'}
              </p>
            </div>

            {IS_STANDALONE ? (
              <>
                <label htmlFor="name" className="mt-6 block font-semibold text-ink">Nama</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  autoComplete="name"
                  autoCapitalize="words"
                  maxLength={NAME_MAX}
                  className={inputCls}
                  aria-invalid={Boolean(error)}
                  aria-describedby="login-error login-hint"
                />
                <p id="login-hint" className="mt-1 text-xs text-slate-500">
                  Gunakan nama yang sama setiap kali masuk agar progresmu dimuat kembali.
                </p>
              </>
            ) : (
              <>
                <label htmlFor="code" className="mt-6 block font-semibold text-ink">Kode Siswa</label>
                <input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Contoh: SMP8-01" autoComplete="username" maxLength={20} className={`formula tracking-wider ${inputCls}`} aria-invalid={Boolean(error)} aria-describedby="login-error" />
                {needKey && (
                  <>
                    <label htmlFor="key" className="mt-4 flex items-center gap-1.5 font-semibold text-ink"><KeyRound className="size-4" /> Access Key Guru</label>
                    <input id="key" type="password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} autoComplete="current-password" className={inputCls} />
                  </>
                )}
              </>
            )}

            <div id="login-error" className="mt-4"><ErrorBox message={error} /></div>

            <Button type="submit" loading={loading} className="mt-4 w-full text-lg" icon={loading ? undefined : ArrowRight}>
              {loading ? 'Menyiapkan petualangan...' : 'Masuk Petualangan'}
            </Button>
            {IS_STANDALONE && (
              <p className="mt-3 text-center text-xs text-slate-400">Progres belajarmu tersimpan di perangkat ini. Gunakan perangkat yang sama agar progres tidak hilang.</p>
            )}
          </form>
        ) : (
          <form onSubmit={submitTeacher} className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8" noValidate>
            <div className="flex flex-col items-center text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-navy text-sun"><GraduationCap className="size-8" /></span>
              <h1 className="mt-3 text-2xl font-black text-navy">Masuk sebagai Guru</h1>
              <p className="mt-1 text-slate-600">Untuk membuka Panel Guru.</p>
            </div>
            <label htmlFor="teacher-code" className="mt-6 block font-semibold text-ink">Kode Guru</label>
            <input id="teacher-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="GURU-01" autoComplete="username" maxLength={20} className={`formula tracking-wider ${inputCls}`} />
            <label htmlFor="key" className="mt-4 flex items-center gap-1.5 font-semibold text-ink"><KeyRound className="size-4" /> Access Key</label>
            <input id="key" type="password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} autoComplete="current-password" className={inputCls} />
            <div id="login-error" className="mt-4"><ErrorBox message={error} /></div>
            <Button type="submit" loading={loading} variant="dark" className="mt-4 w-full text-lg" icon={loading ? undefined : ArrowRight}>Masuk Panel Guru</Button>
          </form>
        )}

        <div className="mt-4 text-center">
          {mode === 'student' ? (
            <button onClick={() => switchMode('teacher')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white">
              <GraduationCap className="size-4" /> Masuk sebagai Guru
            </button>
          ) : (
            <button onClick={() => switchMode('student')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="size-4" /> Kembali ke masuk siswa
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
