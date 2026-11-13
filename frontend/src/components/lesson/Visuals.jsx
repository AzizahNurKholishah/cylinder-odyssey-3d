import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { CircleCheck, Pause, Play } from 'lucide-react'
import { CircleDiagram, NetDiagram, ObjectIcon } from '../Diagrams.jsx'
import Highlighter from '../Highlighter.jsx'
import { Feedback, Part, Spinner } from '../ui/index.jsx'
import { choosePi, circleArea, circumference, clean, fmt, matchesAnswer, parseNumber, PI_LABEL, shuffle, TYPE_LABEL, FORMULA } from '../../lib/cylinder.js'

const CylinderScene = lazy(() => import('../three/CylinderScene.jsx'))
const Scene = (props) => <Suspense fallback={<Spinner label="Menyiapkan model 3D..." />}><CylinderScene {...props} /></Suspense>

// ------------------------------------------------------------ Level 1
export function CircleVisual({ show }) {
  const [r, setR] = useState(7)
  const pi = choosePi(r).pi
  return (
    <div className="flex flex-col items-center gap-2">
      <CircleDiagram r={r} show={show} />
      <label className="w-full max-w-xs text-sm font-semibold text-slate-600">
        Ubah jari-jari: <span className="formula text-ink">r = {fmt(r)} cm</span>
        <input type="range" min="1" max="21" step="0.5" value={r} onChange={(e) => setR(Number(e.target.value))} className="mt-1 w-full" />
      </label>
      <div className="formula grid w-full max-w-xs gap-1 rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
        <span>d = 2 × {fmt(r)} = <b>{fmt(2 * r)} cm</b></span>
        {show.includes('k') && <span>K = 2 × {PI_LABEL[pi]} × {fmt(r)} = <b>{fmt(circumference(r, pi), 2)} cm</b></span>}
        {show.includes('l') && <span>L = {PI_LABEL[pi]} × {fmt(r)}² = <b>{fmt(circleArea(r, pi), 2)} cm²</b></span>}
      </div>
    </div>
  )
}

export function PiChooser() {
  const [r, setR] = useState(7)
  const { pi, reason } = choosePi(r)
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-600">Pilih jari-jari, lihat π yang dipilih:</p>
      <div className="flex flex-wrap gap-2">
        {[7, 10, 14, 5, 21, 3.5, 12, 28].map((v) => (
          <button key={v} onClick={() => setR(v)} className={`formula min-h-11 min-w-14 rounded-lg px-3 font-bold ring-1 ${r === v ? 'bg-royal text-white ring-royal' : 'bg-white ring-slate-300 hover:bg-blue-50'}`}>{fmt(v)}</button>
        ))}
      </div>
      <div className={`rounded-xl p-4 ring-1 ${pi === '22/7' ? 'bg-lilac/15 ring-lilac/50' : 'bg-blue-50 ring-blue-200'}`}>
        <p className="font-display text-3xl font-black text-navy">π = {PI_LABEL[pi]}</p>
        <p className="text-sm text-slate-700">{reason}</p>
        <p className="formula mt-2 text-sm">L = {PI_LABEL[pi]} × {fmt(r)} × {fmt(r)} = <b>{fmt(circleArea(r, pi), 2)} cm²</b></p>
      </div>
    </div>
  )
}

export function PartIdentify({ onDone }) {
  const tasks = useMemo(() => shuffle(['tutup', 'alas', 'selimut']), [])
  const [idx, setIdx] = useState(0)
  const [msg, setMsg] = useState(null)
  const done = idx >= tasks.length
  const label = { tutup: 'TUTUP', alas: 'ALAS', selimut: 'SELIMUT' }

  const onPart = (part) => {
    if (done) return
    if (part === tasks[idx]) {
      setMsg({ ok: true, text: `Tepat! Itu ${part}.` })
      const next = idx + 1
      setIdx(next)
      if (next >= tasks.length) onDone?.()
    } else {
      setMsg({ ok: false, text: `Itu ${part}. Coba cari ${tasks[idx]}. Putar tabungnya jika perlu (alas ada di bawah).` })
    }
  }
  return (
    <div className="space-y-2">
      <div className={`rounded-xl px-3 py-2 text-center font-bold ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-navy text-white'}`}>
        {done ? '🎉 Semua bagian ditemukan!' : <>Misi {idx + 1}/3: klik bagian <span className="text-sun">{label[tasks[idx]]}</span></>}
      </div>
      <Scene r={7} t={10} onPartClick={onPart} className="h-64 sm:h-72" ariaLabel="Tabung 3D yang bisa diklik bagiannya" />
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      <p className="text-center text-xs text-slate-500"><Part name="tutup">tutup</Part> · <Part name="alas">alas</Part> · <Part name="selimut">selimut</Part></p>
    </div>
  )
}

export function RadiusDrill({ onDone }) {
  const items = useMemo(() => shuffle([14, 20, 9, 35, 50, 7]).slice(0, 3), [])
  const [vals, setVals] = useState(['', '', ''])
  const [checked, setChecked] = useState(false)
  const results = items.map((d, i) => matchesAnswer(vals[i], d / 2))
  const allOk = results.every(Boolean)
  useEffect(() => { if (checked && allOk) onDone?.() }, [checked, allOk, onDone])
  return (
    <div className="space-y-3">
      {items.map((d, i) => (
        <label key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <span className="formula font-semibold">d = {d} cm → r =</span>
          <input inputMode="decimal" value={vals[i]} onChange={(e) => { const v = [...vals]; v[i] = e.target.value; setVals(v); setChecked(false) }} className="formula min-h-11 w-24 rounded-lg border border-slate-300 px-2 text-lg" aria-label={`Jari-jari untuk diameter ${d}`} />
          <span>cm</span>
          {checked && (results[i] ? <CircleCheck className="size-5 text-emerald-600" /> : <span className="text-sm text-amber-700">{parseNumber(vals[i]) === d ? 'Itu diameternya, bagi 2!' : 'Coba lagi: r = d ÷ 2'}</span>)}
        </label>
      ))}
      <button onClick={() => setChecked(true)} className="min-h-11 rounded-xl bg-royal px-4 font-semibold text-white">Periksa</button>
      {checked && allOk && <Feedback ok>Hebat! Kamu siap masuk ke rumus tabung.</Feedback>}
    </div>
  )
}

// ------------------------------------------------------------ Level 2
export function useUnfoldAnimation(initial = 0) {
  const [unfold, setUnfold] = useState(initial)
  const [playing, setPlaying] = useState(false)
  const raf = useRef(0)
  const play = () => {
    cancelAnimationFrame(raf.current)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const from = unfold >= 0.99 ? 0 : unfold
    const to = 1
    if (reduce) { setUnfold(to); return }
    const start = performance.now()
    const dur = 2600 * (to - from)
    setPlaying(true)
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur)
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
      setUnfold(from + (to - from) * e)
      if (k < 1) raf.current = requestAnimationFrame(step)
      else setPlaying(false)
    }
    raf.current = requestAnimationFrame(step)
  }
  const stop = () => { cancelAnimationFrame(raf.current); setPlaying(false) }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  return { unfold, setUnfold: (v) => { stop(); setUnfold(v) }, play, stop, playing }
}

export function UnfoldControls({ unfold, setUnfold, play, stop, playing }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={playing ? stop : play} className="grid size-11 shrink-0 place-items-center rounded-full bg-royal text-white" aria-label={playing ? 'Jeda animasi' : 'Putar animasi bentangan'}>
        {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
      </button>
      <label className="flex-1 text-sm font-semibold text-slate-600">
        Bentangan: <span className="formula text-ink">{Math.round(unfold * 100)}%</span>
        <input type="range" min="0" max="100" value={Math.round(unfold * 100)} onChange={(e) => setUnfold(Number(e.target.value) / 100)} className="w-full" aria-label="Persentase bentangan jaring-jaring" />
      </label>
    </div>
  )
}

export function UnfoldVisual({ onDone }) {
  const anim = useUnfoldAnimation(0)
  useEffect(() => { if (anim.unfold >= 0.999) onDone?.() }, [anim.unfold, onDone])
  return (
    <div className="space-y-3">
      <Scene r={7} t={10} unfold={anim.unfold} className="h-72 sm:h-80" />
      <UnfoldControls {...anim} />
      <p className="text-center text-sm text-slate-600">
        <Part name="tutup">1 lingkaran</Part> + <Part name="alas">1 lingkaran</Part> + <Part name="selimut">1 persegi panjang</Part>
      </p>
    </div>
  )
}

export function Derivation({ stage }) {
  const rows = [
    { show: 1, el: <><Part name="selimut">L selimut</Part> = panjang × lebar = <b>2πr × t = 2πrt</b></> },
    { show: 2, el: <><Part name="alas">alas</Part> + <Part name="tutup">tutup</Part> = πr² + πr² = <b>2πr²</b></> },
    { show: 3, el: <>L permukaan = <span className="text-orange-700">2πr²</span> + <span className="text-blue-700">2πrt</span></> },
    { show: 3, el: <>faktor sama: <b>2πr</b> → L = 2πr × r + 2πr × t</> },
    { show: 3, el: <b className="text-lg text-navy">L = 2πr(r + t)</b> },
  ]
  return (
    <div className="space-y-3">
      <NetDiagram r={7} t={10} mode="closed" className="max-h-64" />
      <ol className="formula space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
        {rows.filter((r) => r.show <= stage).map((r, i) => (
          <li key={i} className={`fade-in ${r.show === stage ? '' : 'opacity-60'}`}>{r.el}</li>
        ))}
      </ol>
    </div>
  )
}

// ------------------------------------------------------------ Level 3
export function ModesVisual({ mode: initial, lock }) {
  const [mode, setMode] = useState(initial)
  return (
    <div className="space-y-3">
      {!lock && (
        <div className="grid grid-cols-3 gap-2">
          {['closed', 'open', 'blanket'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`min-h-11 rounded-lg px-2 text-xs font-bold sm:text-sm ${mode === m ? 'bg-royal text-white' : 'bg-white ring-1 ring-slate-300'}`}>{TYPE_LABEL[m]}</button>
          ))}
        </div>
      )}
      <Scene r={7} t={10} mode={mode} className="h-64 sm:h-72" />
      <p className="formula rounded-xl bg-navy px-3 py-2 text-center font-bold text-sun">{FORMULA[mode]}</p>
    </div>
  )
}

const MATCH_ITEMS = [
  { kind: 'kaleng', name: 'Kaleng biskuit tertutup', ans: 'closed' },
  { kind: 'gelas', name: 'Gelas minum', ans: 'open' },
  { kind: 'paralon', name: 'Pipa paralon (terbuka kedua ujung)', ans: 'blanket' },
  { kind: 'drum', name: 'Drum minyak tertutup', ans: 'closed' },
  { kind: 'ember', name: 'Ember tanpa tutup', ans: 'open' },
  { kind: 'label', name: 'Label kertas kaleng susu', ans: 'blanket' },
]

export function MatchActivity({ onDone }) {
  const items = useMemo(() => shuffle(MATCH_ITEMS), [])
  const [picks, setPicks] = useState({})
  const allOk = items.every((it) => picks[it.name] === it.ans)
  useEffect(() => { if (allOk) onDone?.() }, [allOk, onDone])
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const p = picks[it.name]
        return (
          <div key={it.name} className={`flex flex-col gap-2 rounded-xl p-2 ring-1 sm:flex-row sm:items-center ${p ? (p === it.ans ? 'bg-emerald-50 ring-emerald-200' : 'bg-amber-50 ring-amber-200') : 'bg-white ring-slate-200'}`}>
            <div className="flex items-center gap-2 sm:w-56"><ObjectIcon kind={it.kind} className="size-12 shrink-0" /><span className="text-sm font-semibold">{it.name}</span></div>
            <div className="grid flex-1 grid-cols-3 gap-1">
              {['closed', 'open', 'blanket'].map((m) => (
                <button key={m} onClick={() => setPicks({ ...picks, [it.name]: m })} className={`formula min-h-10 rounded-lg px-1 text-[11px] font-bold sm:text-xs ${p === m ? (m === it.ans ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white') : 'bg-white ring-1 ring-slate-300'}`}>
                  {FORMULA[m].replace('L = ', '').replace(' = 2πr(r + t)', '')}
                </button>
              ))}
            </div>
          </div>
        )
      })}
      {allOk ? <Feedback ok>Semua cocok! Kamu resmi jadi Open-Top Specialist.</Feedback>
        : Object.keys(picks).length > 0 && items.some((it) => picks[it.name] && picks[it.name] !== it.ans) && <Feedback>Ada yang belum tepat (oranye). Cek lagi: apakah benda itu punya tutup? Apakah kedua ujungnya terbuka?</Feedback>}
    </div>
  )
}

// ------------------------------------------------------------ Level 4
export function StoryVisual({ story, compact }) {
  return (
    <div className="space-y-3">
      <Highlighter text={story.text} phrases={story.phrases} />
      {!compact && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['Diketahui: r atau d?', 'Tinggi (t)?', 'Banyak benda?', 'Tertutup / tanpa tutup?'].map((x) => (
            <div key={x} className="rounded-lg bg-lilac/10 px-3 py-2 font-semibold text-violet-900 ring-1 ring-lilac/30">{x}</div>
          ))}
        </div>
      )}
      {compact && (
        <div className="rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200">
          <p className="font-bold text-navy">Ditanya:</p>
          <p>Luas seluruh bagian yang dicat untuk <b>4 tong</b>, dalam <b>cm²</b>.</p>
        </div>
      )}
    </div>
  )
}

export function RevealLines({ lines }) {
  const [n, setN] = useState(1)
  return (
    <div className="space-y-3">
      <ol className="formula space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
        {lines.slice(0, n).map((l, i) => <li key={i} className="fade-in"><span className="mr-2 text-slate-400">{i + 1}.</span>{l}</li>)}
      </ol>
      {n < lines.length
        ? <button onClick={() => setN(n + 1)} className="min-h-11 rounded-xl bg-royal px-4 font-semibold text-white">Tampilkan langkah berikutnya ({n}/{lines.length})</button>
        : <Feedback ok>Selesai! Setiap baris hanya satu operasi, jadi tidak mudah tersesat.</Feedback>}
    </div>
  )
}

export function RoundingVisual() {
  const [need, setNeed] = useState(3.72)
  const buy = Math.ceil(need - 1e-9)
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-600">
        Kebutuhan: <span className="formula text-ink">{fmt(need, 2)} kaleng</span>
        <input type="range" min="1" max="8" step="0.01" value={need} onChange={(e) => setNeed(Number(e.target.value))} className="w-full" />
      </label>
      <div className="flex flex-wrap gap-1.5" aria-hidden="true">
        {Array.from({ length: buy }, (_, i) => {
          const fill = Math.min(1, Math.max(0, need - i))
          return (
            <div key={i} className="relative h-14 w-10 overflow-hidden rounded-md bg-slate-200 ring-1 ring-slate-300">
              <div className="absolute inset-x-0 bottom-0 bg-royal" style={{ height: `${fill * 100}%` }} />
            </div>
          )
        })}
      </div>
      <p className="text-sm">Bulatkan ke bawah → {Math.floor(need)} kaleng: <b className="text-red-600">kurang!</b> Bulatkan ke atas → <b className="text-emerald-700">{buy} kaleng: cukup.</b></p>
    </div>
  )
}

const CASE = {
  text: 'Sebuah drum kecil tertutup berdiameter 28 cm dan tinggi 20 cm akan dilapisi stiker di seluruh permukaannya. Stiker dijual per lembar dengan luas 500 cm². Berapa lembar stiker yang harus dibeli? Gunakan π = 22/7.',
  phrases: ['tertutup', 'diameter 28 cm', 'tinggi 20 cm', 'seluruh permukaannya', '500 cm²', 'π = 22/7'],
  fields: [
    { id: 'r', label: 'Langkah 1 — Jari-jari (cm)', ans: 14, tip: 'r = d ÷ 2 = 28 ÷ 2' },
    { id: 'lp', label: 'Langkah 3 — Luas permukaan drum (cm²)', ans: 2992, tip: 'Drum tertutup: 2πr(r + t) = 2 × 22/7 × 14 × 34' },
    { id: 'lembar', label: 'Langkah 4 — Banyak lembar yang dibeli', ans: 6, tip: '2.992 ÷ 500 = 5,984 → bulatkan KE ATAS' },
  ],
}

export function CaseStudy({ onDone }) {
  const [vals, setVals] = useState({})
  const [checked, setChecked] = useState(false)
  const ok = (f) => matchesAnswer(vals[f.id], f.ans)
  const allOk = CASE.fields.every(ok)
  useEffect(() => { if (checked && allOk) onDone?.() }, [checked, allOk, onDone])
  return (
    <div className="space-y-3">
      <Highlighter text={CASE.text} phrases={CASE.phrases} />
      {CASE.fields.map((f) => (
        <label key={f.id} className="block rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <span className="text-sm font-semibold">{f.label}</span>
          <div className="mt-1 flex items-center gap-2">
            <input inputMode="decimal" value={vals[f.id] ?? ''} onChange={(e) => { setVals({ ...vals, [f.id]: e.target.value }); setChecked(false) }} className="formula min-h-11 w-36 rounded-lg border border-slate-300 px-2 text-lg" />
            {checked && (ok(f) ? <CircleCheck className="size-5 text-emerald-600" /> : <span className="text-sm text-amber-700">Petunjuk: {f.tip}</span>)}
          </div>
        </label>
      ))}
      <button onClick={() => setChecked(true)} className="min-h-11 rounded-xl bg-royal px-4 font-semibold text-white">Periksa</button>
      {checked && allOk && <Feedback ok>Hebat! Kamu berhasil menentukan rumus, satuan cm², dan pembulatan dengan tepat!</Feedback>}
      <p className="text-xs text-slate-500">Cek: {clean(2 * 22 / 7 * 14 * 34)} ÷ 500 = {fmt(2992 / 500, 3)} → tidak bisa membeli pecahan lembar.</p>
    </div>
  )
}

export function LessonVisual({ visual, story, onDone }) {
  switch (visual.type) {
    case 'circle': return <CircleVisual show={visual.show} />
    case 'pi': return <PiChooser />
    case 'identify': return <PartIdentify onDone={onDone} />
    case 'radius-drill': return <RadiusDrill onDone={onDone} />
    case 'unfold': return <UnfoldVisual onDone={onDone} />
    case 'net': return <NetDiagram r={visual.r} t={visual.t} mode={visual.mode} />
    case 'derive': return <Derivation stage={visual.stage} />
    case 'modes': return <ModesVisual mode={visual.mode} lock={visual.lock} />
    case 'match': return <MatchActivity onDone={onDone} />
    case 'story': return <StoryVisual story={story} compact={visual.compact} />
    case 'reveal': return <RevealLines lines={visual.lines} />
    case 'rounding': return <RoundingVisual />
    case 'case': return <CaseStudy onDone={onDone} />
    default: return null
  }
}
