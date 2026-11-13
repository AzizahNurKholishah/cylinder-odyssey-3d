import { Link } from 'react-router-dom'
import { CircleCheck, CircleX, LoaderCircle, TriangleAlert } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-royal text-white hover:bg-blue-700 shadow-sm shadow-blue-900/20',
  secondary: 'bg-white text-ink ring-1 ring-slate-300 hover:bg-slate-50',
  ghost: 'text-royal hover:bg-blue-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  sun: 'bg-sun text-navy hover:bg-yellow-300 shadow-sm',
  dark: 'bg-navy text-white hover:bg-navy-2',
}

export function Button({ variant = 'primary', className = '', loading = false, children, to, icon: Icon, ...props }) {
  const cls = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`
  const content = (
    <>
      {loading ? <LoaderCircle className="size-5 animate-spin" /> : Icon ? <Icon className="size-5" /> : null}
      {children}
    </>
  )
  if (to) return <Link to={to} className={cls}>{content}</Link>
  return <button className={cls} disabled={loading || props.disabled} {...props}>{content}</button>
}

export function Card({ className = '', children, ...props }) {
  return <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 ${className}`} {...props}>{children}</div>
}

export function ProgressBar({ value, max = 100, color = 'bg-mint', className = '', label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={className}>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Spinner({ label = 'Memuat...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <LoaderCircle className="size-6 animate-spin text-royal" /> {label}
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3 text-red-800 ring-1 ring-red-200" role="alert">
      <TriangleAlert className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && <button className="mt-1 font-semibold underline" onClick={onRetry}>Coba lagi</button>}
      </div>
    </div>
  )
}

export function Feedback({ ok, children }) {
  return (
    <div className={`fade-in flex items-start gap-2 rounded-xl p-3 text-sm ring-1 ${ok ? 'bg-emerald-50 text-emerald-900 ring-emerald-200' : 'bg-amber-50 text-amber-900 ring-amber-200'}`} role="status">
      {ok ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <CircleX className="mt-0.5 size-5 shrink-0 text-amber-600" />}
      <div>{children}</div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, subtitle, icon: Icon, children }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy text-sun">
            <Icon className="size-6" />
          </span>
        )}
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-royal">{eyebrow}</p>}
          <h1 className="text-2xl font-black text-navy sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {children}
    </header>
  )
}

/** Chip berwarna untuk bagian tabung agar warna konsisten di semua layar. */
export function Part({ name, children, solid = false }) {
  const cls = solid
    ? { tutup: 'bg-tutup text-navy ring-tutup', alas: 'bg-alas text-navy ring-alas', selimut: 'bg-selimut text-navy ring-selimut' }[name]
    : {
      tutup: 'bg-tutup/30 text-yellow-900 ring-tutup',
      alas: 'bg-alas/25 text-orange-900 ring-alas',
      selimut: 'bg-selimut/25 text-blue-900 ring-selimut',
    }[name]
  return <span className={`rounded-md px-1.5 py-0.5 font-semibold ring-1 ${cls}`}>{children}</span>
}
