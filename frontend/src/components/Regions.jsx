import { Award, Castle, CircleDot, CupSoda, Gamepad2, Layers, Lock, Mountain, Sigma, Trophy, Wrench, Zap } from 'lucide-react'

export const REGION_STYLE = {
  'lembah-lingkaran': { icon: CircleDot, bg: 'bg-sun', text: 'text-navy', tag: 'Prasyarat & Unsur' },
  'bengkel-jaring': { icon: Wrench, bg: 'bg-selimut', text: 'text-navy', tag: 'Asal Rumus' },
  'benteng-terbuka': { icon: Castle, bg: 'bg-alas', text: 'text-navy', tag: 'Tertutup vs Tanpa Tutup' },
  'puncak-literasi': { icon: Mountain, bg: 'bg-lilac', text: 'text-navy', tag: 'Soal Kontekstual' },
}

const BADGE_ICONS = { 'circle-dot': CircleDot, layers: Layers, sigma: Sigma, 'cup-soda': CupSoda, zap: Zap, 'gamepad-2': Gamepad2, trophy: Trophy }

export function BadgeTile({ badge, compact = false }) {
  const Icon = BADGE_ICONS[badge.icon_name] || Award
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 ring-1 ${badge.unlocked ? 'bg-sun/15 ring-sun/60' : 'bg-slate-50 ring-slate-200'}`} title={badge.description}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${badge.unlocked ? 'bg-sun text-navy' : 'bg-slate-200 text-slate-400'}`}>
        {badge.unlocked ? <Icon className="size-6" /> : <Lock className="size-5" />}
      </span>
      <div className="min-w-0">
        <p className={`font-bold leading-tight ${badge.unlocked ? 'text-navy' : 'text-slate-500'}`}>{badge.title}</p>
        {!compact && <p className="text-xs text-slate-500">{badge.description}</p>}
      </div>
    </div>
  )
}

/** Peta ringkas 4 wilayah (jalur berliku). */
export function MiniMap({ lessons, onSelect }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 400 90" className="absolute inset-x-0 top-6 h-12 w-full" preserveAspectRatio="none" aria-hidden="true">
        <path d="M30 45 C 90 0, 140 90, 200 45 S 310 0, 370 45" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="10 8" strokeLinecap="round" />
      </svg>
      <ol className="relative grid grid-cols-4 gap-2">
        {lessons.map((l) => {
          const st = REGION_STYLE[l.slug]
          const Icon = st.icon
          return (
            <li key={l.slug} className="flex flex-col items-center text-center">
              <button
                onClick={() => l.is_unlocked && onSelect?.(l)}
                disabled={!l.is_unlocked}
                className={`relative grid size-14 place-items-center rounded-full ring-4 transition-transform sm:size-16 ${l.is_unlocked ? `${st.bg} ${st.text} ring-white hover:scale-105` : 'bg-slate-200 text-slate-400 ring-white'}`}
                aria-label={`Level ${l.level_number} ${l.title}${l.is_completed ? ' (selesai)' : l.is_unlocked ? '' : ' (terkunci)'}`}
              >
                {l.is_unlocked ? <Icon className="size-7" /> : <Lock className="size-6" />}
                {l.is_completed && <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white ring-2 ring-white">✓</span>}
              </button>
              <span className="mt-1.5 text-xs font-bold text-navy sm:text-sm">0{l.level_number}</span>
              <span className="text-[11px] leading-tight text-slate-600 sm:text-xs">{l.title}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
