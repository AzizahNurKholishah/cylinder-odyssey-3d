import { createContext, useCallback, useContext, useState } from 'react'
import { Award, Sparkles, X } from 'lucide-react'

const RewardContext = createContext(() => {})

/** Menampilkan notifikasi +XP dan lencana baru dari respons backend. */
export function RewardProvider({ children }) {
  const [items, setItems] = useState([])

  const notify = useCallback((res) => {
    if (!res) return
    const next = []
    if (res.xp_awarded > 0) next.push({ id: crypto.randomUUID?.() ?? Math.random(), kind: 'xp', text: `+${res.xp_awarded} XP` })
    for (const b of res.new_badges || []) {
      next.push({ id: crypto.randomUUID?.() ?? Math.random(), kind: 'badge', text: `Lencana baru: ${b.title}`, sub: b.description })
    }
    if (!next.length) return
    setItems((cur) => [...cur, ...next])
    for (const it of next) setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== it.id)), 4500)
  }, [])

  return (
    <RewardContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {items.map((it) => (
          <div key={it.id} className="pop-in pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl bg-navy px-4 py-3 text-white shadow-xl">
            {it.kind === 'xp' ? <Sparkles className="mt-0.5 size-5 text-sun" /> : <Award className="mt-0.5 size-5 text-sun" />}
            <div className="flex-1">
              <p className="font-display font-extrabold">{it.text}</p>
              {it.sub && <p className="text-sm text-blue-100">{it.sub}</p>}
            </div>
            <button aria-label="Tutup" onClick={() => setItems((cur) => cur.filter((x) => x.id !== it.id))}>
              <X className="size-4 text-blue-200" />
            </button>
          </div>
        ))}
      </div>
    </RewardContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReward() {
  return useContext(RewardContext)
}
