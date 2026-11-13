import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Calculator, FlaskConical, Ruler } from 'lucide-react'
import { Companion } from '../components/Brand.jsx'
import { NetDiagram } from '../components/Diagrams.jsx'
import { UnfoldControls, useUnfoldAnimation } from '../components/lesson/Visuals.jsx'
import { Button, Card, ErrorBox, PageHeader, Part, Spinner } from '../components/ui/index.jsx'
import { useReward } from '../context/RewardContext.jsx'
import { API } from '../lib/api.js'
import { blanketArea, choosePi, circleArea, circumference, fmt, FORMULA, parseNumber, PI_LABEL, solutionSteps, surfaceArea, TYPE_LABEL, validatePositive } from '../lib/cylinder.js'

const CylinderScene = lazy(() => import('../components/three/CylinderScene.jsx'))

const MODES = ['closed', 'open', 'blanket']

function ModeButtons({ mode, setMode }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Mode kondisi tabung">
      {MODES.map((m) => (
        <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`min-h-11 rounded-xl px-2 text-xs font-bold sm:text-sm ${mode === m ? 'bg-royal text-white' : 'bg-white ring-1 ring-slate-300 hover:bg-blue-50'}`}>
          {TYPE_LABEL[m]}
        </button>
      ))}
    </div>
  )
}

function Calc() {
  const [inputType, setInputType] = useState('r')
  const [value, setValue] = useState('7')
  const [height, setHeight] = useState('10')
  const [type, setType] = useState('closed')
  const [pi, setPi] = useState('auto')
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})

  const compute = (e) => {
    e?.preventDefault()
    const errs = {
      value: validatePositive(value, inputType === 'r' ? 'Jari-jari' : 'Diameter'),
      height: validatePositive(height, 'Tinggi'),
    }
    setErrors(errs)
    if (errs.value || errs.height) { setResult(null); return }
    setResult(solutionSteps({ inputType, value: parseNumber(value), t: parseNumber(height), type, pi }))
  }

  return (
    <Card>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-navy"><Calculator className="size-5 text-royal" /> Kalkulator Langkah demi Langkah</h2>
      <form onSubmit={compute} className="grid gap-3 sm:grid-cols-2" noValidate>
        <fieldset>
          <legend className="text-sm font-semibold">Yang diketahui</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[['r', 'Jari-jari (r)'], ['d', 'Diameter (d)']].map(([k, l]) => (
              <button type="button" key={k} onClick={() => setInputType(k)} className={`min-h-11 rounded-lg text-sm font-bold ${inputType === k ? 'bg-royal text-white' : 'bg-white ring-1 ring-slate-300'}`}>{l}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold">Jenis tabung</legend>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2">
            {MODES.map((m) => <option key={m} value={m}>{TYPE_LABEL[m]}</option>)}
          </select>
        </fieldset>
        <label className="text-sm font-semibold">{inputType === 'r' ? 'Jari-jari' : 'Diameter'} (cm)
          <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="formula mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-lg" aria-invalid={Boolean(errors.value)} />
          {errors.value && <span className="text-xs text-red-600">{errors.value}</span>}
        </label>
        <label className="text-sm font-semibold">Tinggi t (cm)
          <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className="formula mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-lg" aria-invalid={Boolean(errors.height)} />
          {errors.height && <span className="text-xs text-red-600">{errors.height}</span>}
        </label>
        <label className="text-sm font-semibold">Nilai π
          <select value={pi} onChange={(e) => setPi(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2">
            <option value="auto">Otomatis (disarankan)</option>
            <option value="22/7">22/7</option>
            <option value="3.14">3,14</option>
          </select>
        </label>
        <div className="flex items-end"><Button type="submit" className="w-full" icon={Calculator}>Hitung</Button></div>
      </form>
      {result && (
        <ol className="mt-4 space-y-2">
          {result.steps.map((s, i) => (
            <li key={s.label} className={`fade-in flex gap-3 rounded-xl p-3 ring-1 ${i === result.steps.length - 1 ? 'bg-mint/30 ring-emerald-300' : 'bg-slate-50 ring-slate-200'}`}>
              <span className="w-24 shrink-0 text-sm font-bold text-royal">{s.label}</span>
              <span className="formula text-sm sm:text-base">{s.text}</span>
            </li>
          ))}
          <li className="text-xs text-slate-500">Cek ulang: satuan luas selalu persegi (cm²).</li>
        </ol>
      )}
    </Card>
  )
}

export default function Lab() {
  const notify = useReward()
  const [mode, setMode] = useState('closed')
  const [r, setR] = useState(7)
  const [t, setT] = useState(10)
  const [dimInput, setDimInput] = useState('r')
  const [labels, setLabels] = useState(true)
  const anim = useUnfoldAnimation(0)
  const reported = useRef(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    if (anim.unfold >= 0.999 && !reported.current) {
      reported.current = true
      API.labExplored('unfold').then(notify).catch((e) => { reported.current = false; setReportError(e.message) })
    }
  }, [anim.unfold, notify])

  const { pi, reason } = choosePi(r)
  const base = circleArea(r, pi)
  const blanket = blanketArea(r, t, pi)
  const total = surfaceArea(r, t, mode, pi)

  return (
    <div className="space-y-5">
      <PageHeader icon={FlaskConical} eyebrow="Cylinder Laboratory" title="Laboratorium Tabung 3D" subtitle="Ruang eksplorasi bebas tanpa nilai. Putar, buka, ubah ukuran, dan amati apa yang terjadi pada rumus." />
      <Companion>Coba bentangkan tabungnya sampai 100%. Ada berapa lingkaran yang kamu lihat? Lalu ganti mode ke &quot;Tanpa Tutup&quot;, bagian mana yang hilang?</Companion>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <Suspense fallback={<Spinner label="Menyiapkan model 3D..." />}>
            <CylinderScene r={r} t={t} mode={mode} unfold={anim.unfold} showLabels={labels} className="h-80 sm:h-[26rem]" />
          </Suspense>
          {/* rumus tepat di bawah model (spatial contiguity) */}
          <div className="rounded-2xl bg-navy p-4 text-white">
            <p className="formula text-center text-lg font-bold text-sun">{FORMULA[mode]}</p>
            <div className="formula mt-2 grid gap-1 text-sm sm:grid-cols-3">
              {mode !== 'blanket' && <span><Part solid name="alas">alas</Part> πr² = {fmt(base, 2)}</span>}
              {mode === 'closed' && <span><Part solid name="tutup">tutup</Part> πr² = {fmt(base, 2)}</span>}
              <span><Part solid name="selimut">selimut</Part> 2πrt = {fmt(blanket, 2)}</span>
            </div>
            <p className="formula mt-2 text-center text-xl font-black">L = {fmt(total, 2)} cm²</p>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="mb-2 font-extrabold text-navy">A. Mode Kondisi Tabung</h2>
            <ModeButtons mode={mode} setMode={setMode} />
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} className="size-4" /> Tampilkan label ukuran</label>
          </Card>
          <Card>
            <h2 className="mb-2 font-extrabold text-navy">B. Jaring-Jaring 3D</h2>
            <UnfoldControls {...anim} />
            <p className="formula mt-2 text-sm">panjang selimut = 2πr = <b>{fmt(circumference(r, pi), 2)} cm</b> · lebar = t = <b>{fmt(t)} cm</b></p>
            <ErrorBox message={reportError} />
          </Card>
          <Card>
            <h2 className="mb-2 flex items-center gap-2 font-extrabold text-navy"><Ruler className="size-5 text-royal" /> C. Dimension Builder</h2>
            <div className="mb-2 grid grid-cols-2 gap-2">
              {[['r', 'Atur r'], ['d', 'Atur d']].map(([k, l]) => (
                <button key={k} onClick={() => setDimInput(k)} className={`min-h-10 rounded-lg text-sm font-bold ${dimInput === k ? 'bg-royal text-white' : 'bg-white ring-1 ring-slate-300'}`}>{l}</button>
              ))}
            </div>
            {dimInput === 'r' ? (
              <label className="block text-sm font-semibold">Jari-jari r = <span className="formula">{fmt(r)} cm</span>
                <input type="range" min="1" max="28" step="0.5" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full" />
              </label>
            ) : (
              <label className="block text-sm font-semibold">Diameter d = <span className="formula">{fmt(2 * r)} cm</span> → r = d ÷ 2 = <span className="formula">{fmt(r)} cm</span>
                <input type="range" min="2" max="56" step="1" value={2 * r} onChange={(e) => setR(Number(e.target.value) / 2)} className="w-full" />
              </label>
            )}
            <label className="mt-2 block text-sm font-semibold">Tinggi t = <span className="formula">{fmt(t)} cm</span>
              <input type="range" min="1" max="40" step="1" value={t} onChange={(e) => setT(Number(e.target.value))} className="w-full" />
            </label>
            <div className="mt-2 rounded-lg bg-lilac/15 p-2 text-sm ring-1 ring-lilac/40"><b>π = {PI_LABEL[pi]}</b> · {reason}</div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-extrabold text-navy">Jaring-Jaring 2D ({TYPE_LABEL[mode]})</h2>
          <NetDiagram r={r} t={t} mode={mode} pi={pi} />
        </Card>
        <Calc />
      </div>
    </div>
  )
}
