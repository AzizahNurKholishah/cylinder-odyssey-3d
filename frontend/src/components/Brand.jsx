import { useState } from 'react'
import { X } from 'lucide-react'

export function LogoMark({ className = 'size-10' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#172554" />
      <path d="M17 19v26c0 4.4 6.7 8 15 8s15-3.6 15-8V19" fill="#60A5FA" />
      <path d="M17 45c0 4.4 6.7 8 15 8s15-3.6 15-8" fill="none" stroke="#FB923C" strokeWidth="2.5" />
      <ellipse cx="32" cy="19" rx="15" ry="7" fill="#FACC15" />
      <path d="M47 22l9 4v14l-9-3" fill="#A78BFA" opacity=".9" />
    </svg>
  )
}

export function Logo({ dark = false }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="size-9" />
      <span className={`font-display text-lg font-black leading-none ${dark ? 'text-white' : 'text-navy'}`}>
        Cylinder<span className="text-royal"> Odyssey</span> <span className="text-sun">3D</span>
      </span>
    </span>
  )
}

/** Tubi — robot tabung pendamping belajar. */
export function Tubi({ className = 'size-16', mood = 'happy' }) {
  const mouth = {
    happy: 'M25 41q7 6 14 0',
    think: 'M26 42h12',
    wow: 'M32 43m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  }[mood]
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true">
      <line x1="32" y1="4" x2="32" y2="12" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="4" r="3.5" fill="#FACC15" />
      <path d="M12 16v40c0 5.5 9 10 20 10s20-4.5 20-10V16" fill="#60A5FA" />
      <path d="M12 56c0 5.5 9 10 20 10s20-4.5 20-10" fill="none" stroke="#FB923C" strokeWidth="3" />
      <ellipse cx="32" cy="16" rx="20" ry="8" fill="#FACC15" />
      <rect x="17" y="26" width="30" height="22" rx="10" fill="#F8FAFC" />
      <circle cx="26" cy="35" r="3" fill="#172554" />
      <circle cx="38" cy="35" r="3" fill="#172554" />
      <path d={mouth} stroke="#172554" strokeWidth="2.5" fill={mood === 'wow' ? '#172554' : 'none'} strokeLinecap="round" />
      <circle cx="20" cy="41" r="2" fill="#FB923C" opacity=".6" />
      <circle cx="44" cy="41" r="2" fill="#FB923C" opacity=".6" />
    </svg>
  )
}

/** Gelembung bicara Tubi. Bisa ditutup agar tidak mengganggu fokus. */
export function Companion({ children, mood = 'happy', title = 'Tubi', dismissible = true, className = '' }) {
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={`flex items-center gap-2 text-sm font-semibold text-royal ${className}`}>
        <Tubi className="size-8" mood={mood} /> Tanya Tubi
      </button>
    )
  }
  return (
    <div className={`fade-in flex items-start gap-3 ${className}`}>
      <Tubi className="size-14 shrink-0" mood={mood} />
      <div className="relative flex-1 rounded-2xl rounded-tl-sm bg-lilac/15 px-4 py-3 text-ink ring-1 ring-lilac/40">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-700">{title}</p>
        <div className="text-[0.95rem]">{children}</div>
        {dismissible && (
          <button aria-label="Sembunyikan pesan Tubi" onClick={() => setOpen(false)} className="absolute right-2 top-2 rounded p-1 text-violet-500 hover:bg-lilac/20">
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
