import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, KeyRound } from 'lucide-react'
import { Logo, Tubi } from '../components/Brand.jsx'
import { Button, ErrorBox } from '../components/ui/index.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { IS_STANDALONE } from '../lib/api.js'

const CODE_RE = /^[A-Z0-9]{2,8}-[A-Z0-9]{1,6}$/

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [code, setCode] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [needKey, setNeedKey] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={user.role === 'teacher' ? '/admin' : '/dashboard'} replace />

  const submit = async (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase().replace(/\s/g, '')
    if (!c) return setError('Kode siswa belum diisi.')
    if (!CODE_RE.test(c)) return setError('Format kode tidak valid. Contoh: SMP8-01.')
    if (needKey && !accessKey) return setError('Masukkan access key guru.')
    setError('')
    setLoading(true)
    try {
      const profile = await login(c, needKey ? accessKey : undefined)
      const home = profile.role === 'teacher' ? '/admin' : '/dashboard'
      const from = location.state?.from
      // kembali ke halaman yang diminta hanya jika cocok dengan peran (guru tidak dikirim ke halaman siswa sebelumnya)
      const dest = from && (profile.role === 'teacher') === from.startsWith('/admin') ? from : home
      navigate(dest, { replace: true })
    } catch (err) {
      if (err.code === 'access_key_required') {
        setNeedKey(true)
        setError('Ini akun guru. Masukkan access key untuk melanjutkan.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-navy px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link to="/"><Logo dark /></Link></div>
        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8" noValidate>
          <div className="flex flex-col items-center text-center">
            <Tubi className="size-20" />
            <h1 className="mt-2 text-2xl font-black text-navy">Selamat Datang, Penjelajah!</h1>
            <p className="mt-1 text-slate-600">Masukkan kode siswa dari gurumu untuk memulai petualangan.</p>
          </div>

          <label htmlFor="code" className="mt-6 block font-semibold text-ink">Kode Siswa</label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Contoh: SMP8-01"
            autoComplete="username"
            autoCapitalize="characters"
            maxLength={20}
            className="formula mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg tracking-wider focus:border-royal focus:outline-none"
            aria-invalid={Boolean(error)}
            aria-describedby="login-error"
          />

          {needKey && (
            <>
              <label htmlFor="key" className="mt-4 flex items-center gap-1.5 font-semibold text-ink"><KeyRound className="size-4" /> Access Key Guru</label>
              <input
                id="key"
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                autoComplete="current-password"
                className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 focus:border-royal focus:outline-none"
              />
            </>
          )}

          <div id="login-error" className="mt-4"><ErrorBox message={error} /></div>

          <Button type="submit" loading={loading} className="mt-4 w-full text-lg" icon={loading ? undefined : ArrowRight}>
            {loading ? 'Memeriksa kode...' : 'Masuk Petualangan'}
          </Button>
          <p className="mt-4 text-center text-sm text-slate-500">Belum punya kode? Tanyakan kepada guru matematikamu.</p>
          {IS_STANDALONE && <p className="mt-2 text-center text-xs text-slate-400">Progres belajarmu tersimpan di perangkat ini. Gunakan perangkat yang sama agar progres tidak hilang.</p>}
        </form>
      </div>
    </div>
  )
}
