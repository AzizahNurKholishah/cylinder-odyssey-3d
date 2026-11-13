import { useEffect, useRef, useState } from 'react'
import { Heart, Timer } from 'lucide-react'

/** Hitung mundur; memanggil onEnd saat 0. reset dengan mengganti `key`. */
export function useCountdown(seconds, onEnd, running = true) {
  const [left, setLeft] = useState(seconds)
  const endRef = useRef(onEnd)
  endRef.current = onEnd
  useEffect(() => {
    if (!running) return undefined
    if (left <= 0) { endRef.current?.(); return undefined }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(id)
  }, [left, running])
  return [left, setLeft]
}

export function GameHud({ round, total, score, timeLeft, lives }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white">
      {round !== undefined && <span>Ronde {Math.min(round + 1, total)}/{total}</span>}
      {lives !== undefined && (
        <span className="flex gap-0.5" aria-label={`${lives} nyawa`}>
          {Array.from({ length: 3 }, (_, i) => <Heart key={i} className={`size-5 ${i < lives ? 'fill-red-400 text-red-400' : 'text-white/30'}`} />)}
        </span>
      )}
      {timeLeft !== undefined && <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-red-300' : ''}`}><Timer className="size-4" />{timeLeft}s</span>}
      <span className="text-sun">Skor {Math.round(score)}</span>
    </div>
  )
}
