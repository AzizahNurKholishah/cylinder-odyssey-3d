import { fmt } from '../lib/cylinder.js'

/** Jaring-jaring tabung 2D (SVG) dengan ukuran dinamis. */
export function NetDiagram({ r = 7, t = 10, mode = 'closed', pi = '22/7', className = '' }) {
  const piV = pi === '22/7' ? 22 / 7 : 3.14
  const p = 2 * piV * r
  const W = 320
  const scale = Math.min((W - 40) / p, 120 / t, 60 / (2 * r))
  const rw = p * scale
  const rh = t * scale
  const rr = r * scale
  const x0 = (W - rw) / 2
  const top = mode === 'closed' ? rr * 2 + 14 : 14
  const H = top + rh + (mode !== 'blanket' ? rr * 2 + 34 : 34)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${className}`} role="img" aria-label="Jaring-jaring tabung">
      {mode === 'closed' && <circle cx={W / 2} cy={top - rr} r={rr} fill="#FACC15" stroke="#a16207" strokeWidth="1.5" />}
      {mode === 'closed' && <text x={W / 2} y={top - rr + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#713f12">tutup πr²</text>}
      <rect x={x0} y={top} width={rw} height={rh} fill="#60A5FA" stroke="#1e40af" strokeWidth="1.5" rx="2" />
      <text x={W / 2} y={top + rh / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#172554">selimut 2πrt</text>
      {mode !== 'blanket' && <circle cx={W / 2} cy={top + rh + rr} r={rr} fill="#FB923C" stroke="#9a3412" strokeWidth="1.5" />}
      {mode !== 'blanket' && <text x={W / 2} y={top + rh + rr + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#7c2d12">alas πr²</text>}
      {/* ukuran */}
      <line x1={x0} y1={top + rh + (mode !== 'blanket' ? rr * 2 + 14 : 14)} x2={x0 + rw} y2={top + rh + (mode !== 'blanket' ? rr * 2 + 14 : 14)} stroke="#1d4ed8" strokeWidth="1.5" markerStart="url(#a)" markerEnd="url(#a)" />
      <text x={W / 2} y={top + rh + (mode !== 'blanket' ? rr * 2 + 28 : 28)} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1d4ed8">
        panjang = 2πr = {fmt(p, 2)} cm
      </text>
      <text x={x0 + rw + 4} y={top + rh / 2 + 4} fontSize="11" fontWeight="700" fill="#172554">t={fmt(t)}</text>
      <defs>
        <marker id="a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#1d4ed8" />
        </marker>
      </defs>
    </svg>
  )
}

/** Lingkaran dengan jari-jari & diameter; `show` = 'r' | 'd' | 'k' | 'l'. */
export function CircleDiagram({ r = 7, show = ['r', 'd'], className = '' }) {
  const R = 70
  return (
    <svg viewBox="0 0 220 200" className={`w-full max-w-xs ${className}`} role="img" aria-label="Lingkaran dengan jari-jari dan diameter">
      <circle cx="110" cy="95" r={R} fill={show.includes('l') ? '#FACC15' : '#fef9c3'} stroke={show.includes('k') ? '#dc2626' : '#a16207'} strokeWidth={show.includes('k') ? 5 : 2} />
      <circle cx="110" cy="95" r="3.5" fill="#172554" />
      {show.includes('d') && (
        <>
          <line x1={110 - R} y1="95" x2={110 + R} y2="95" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="6 4" />
          <text x="110" y="88" textAnchor="middle" fontSize="13" fontWeight="700" fill="#6d28d9">d = {fmt(2 * r)} cm</text>
        </>
      )}
      {show.includes('r') && (
        <>
          <line x1="110" y1="95" x2={110 + R * 0.7} y2={95 + R * 0.71} stroke="#c2410c" strokeWidth="3" />
          <text x="150" y="150" fontSize="13" fontWeight="700" fill="#c2410c">r = {fmt(r)} cm</text>
        </>
      )}
      {show.includes('k') && <text x="110" y="190" textAnchor="middle" fontSize="13" fontWeight="700" fill="#dc2626">keliling = tepi lingkaran</text>}
      {show.includes('l') && <text x="110" y="120" textAnchor="middle" fontSize="13" fontWeight="700" fill="#713f12">luas = daerah</text>}
    </svg>
  )
}

/** Ikon benda sehari-hari berbentuk tabung (SVG sederhana). */
export function ObjectIcon({ kind, className = 'size-20' }) {
  const common = { viewBox: '0 0 80 80', className, role: 'img' }
  const body = (fill, label, { lid = true, base = true, open = false } = {}) => (
    <svg {...common} aria-label={label}>
      <path d="M18 20v40c0 4.4 9.8 8 22 8s22-3.6 22-8V20" fill={fill} stroke="#1e3a8a" strokeWidth="1.5" />
      {base && <path d="M18 60c0 4.4 9.8 8 22 8s22-3.6 22-8" fill="none" stroke="#FB923C" strokeWidth="3" />}
      {lid ? <ellipse cx="40" cy="20" rx="22" ry="7" fill="#FACC15" stroke="#a16207" strokeWidth="1.5" />
        : <ellipse cx="40" cy="20" rx="22" ry="7" fill={open ? '#0f172a' : 'none'} fillOpacity=".25" stroke="#1e3a8a" strokeWidth="1.5" />}
    </svg>
  )
  switch (kind) {
    case 'kaleng': return body('#93c5fd', 'Kaleng tertutup')
    case 'drum': return body('#60A5FA', 'Drum tertutup')
    case 'gelas': return body('#bfdbfe', 'Gelas tanpa tutup', { lid: false, open: true })
    case 'ember': return body('#a5b4fc', 'Ember tanpa tutup', { lid: false, open: true })
    case 'tong': return body('#86efac', 'Tong sampah tanpa tutup', { lid: false, open: true })
    case 'paralon':
      return (
        <svg {...common} aria-label="Pipa paralon terbuka kedua ujung">
          <path d="M10 30h56v20H10z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="10" cy="40" rx="5" ry="10" fill="#0f172a" fillOpacity=".25" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="66" cy="40" rx="5" ry="10" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="66" cy="40" rx="3" ry="7" fill="#0f172a" fillOpacity=".3" />
        </svg>
      )
    case 'label':
      return (
        <svg {...common} aria-label="Label kertas kaleng">
          <path d="M18 20v40c0 4.4 9.8 8 22 8s22-3.6 22-8V20" fill="#e2e8f0" stroke="#94a3b8" />
          <path d="M18 30v22c0 4.4 9.8 8 22 8s22-3.6 22-8V30c0 4.4-9.8 8-22 8s-22-3.6-22-8z" fill="#60A5FA" stroke="#1e40af" strokeWidth="1.5" />
          <ellipse cx="40" cy="20" rx="22" ry="7" fill="#cbd5e1" stroke="#94a3b8" />
        </svg>
      )
    case 'celengan': return body('#f9a8d4', 'Celengan tabung')
    default: return body('#93c5fd', 'Tabung')
  }
}
