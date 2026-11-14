import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Dumbbell, FlaskConical, Gamepad2, House, LogOut, Map, Trophy, User, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Logo } from '../Brand.jsx'
import { Spinner } from '../ui/index.jsx'

const NAV = [
  { to: '/dashboard', label: 'Beranda', icon: House },
  { to: '/map', label: 'Peta', icon: Map },
  { to: '/lab', label: 'Lab 3D', icon: FlaskConical },
  { to: '/training', label: 'Latihan', icon: Dumbbell },
  { to: '/playground', label: 'Game', icon: Gamepad2 },
]

export function ProtectedRoute({ teacher = false }) {
  const { user, loading, loggedOut } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner label="Memeriksa sesi..." />
  // simpan halaman tujuan hanya untuk tautan langsung/sesi berakhir, bukan setelah Keluar
  if (!user) return <Navigate to="/login" replace state={loggedOut ? undefined : { from: location.pathname }} />
  if (teacher && user.role !== 'teacher') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function AppShell() {
  const { user, logout: clearSession } = useAuth()
  const navigate = useNavigate()
  // Keluar → halaman login tanpa "halaman terakhir", agar pengguna berikutnya tidak diarahkan ke halaman milik orang lain
  const logout = () => { clearSession(); navigate('/login', { replace: true }) }
  const isTeacher = user?.role === 'teacher'
  return (
    <div className="min-h-dvh pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 bg-navy text-white shadow-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/dashboard" aria-label="Beranda"><Logo dark /></Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-white/15 text-sun' : 'text-blue-100 hover:bg-white/10'}`}>
                <Icon className="size-4" /> {label}
              </NavLink>
            ))}
            <NavLink to="/final" className={({ isActive }) => `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-white/15 text-sun' : 'text-blue-100 hover:bg-white/10'}`}>
              <Trophy className="size-4" /> Final
            </NavLink>
          </nav>
          <div className="flex items-center gap-1">
            {isTeacher && (
              <Link to="/admin" className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-sun hover:bg-white/10">
                <Users className="size-5" /><span className="hidden sm:inline">Panel Guru</span>
              </Link>
            )}
            <Link to="/profile" className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-white/10" aria-label="Profil">
              <User className="size-5" /><span className="hidden max-w-40 truncate sm:inline">{user?.role === 'teacher' ? user?.student_code : user?.full_name}</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-blue-100 hover:bg-white/10" aria-label="Keluar">
              <LogOut className="size-5" /><span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
        <Outlet />
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:hidden" aria-label="Navigasi bawah">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${isActive ? 'text-royal' : 'text-slate-500'}`}>
                {({ isActive }) => (
                  <>
                    <span className={`grid h-7 w-12 place-items-center rounded-full ${isActive ? 'bg-blue-100' : ''}`}><Icon className="size-5" /></span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
