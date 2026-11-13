// Rumus lingkaran & tabung + format angka gaya Indonesia.

export const PI = { '22/7': 22 / 7, '3.14': 3.14 }
export const PI_LABEL = { '22/7': '22/7', '3.14': '3,14' }

export const TYPE_LABEL = {
  closed: 'Tabung Tertutup',
  open: 'Tabung Tanpa Tutup',
  blanket: 'Selimut Saja',
}

export const FORMULA = {
  closed: 'L = 2πr² + 2πrt = 2πr(r + t)',
  open: 'L = πr² + 2πrt',
  blanket: 'L = 2πrt',
}

const isMultipleOf7 = (x) => x > 0 && Math.abs(x / 7 - Math.round(x / 7)) < 1e-9

export function choosePi(r) {
  const d = 2 * r
  if (isMultipleOf7(r)) return { pi: '22/7', reason: `r = ${fmt(r)} kelipatan 7 → pakai π = 22/7 agar hitungan sederhana.` }
  if (isMultipleOf7(d)) return { pi: '22/7', reason: `d = ${fmt(d)} kelipatan 7 → pakai π = 22/7 agar hitungan sederhana.` }
  return { pi: '3.14', reason: `r = ${fmt(r)} dan d = ${fmt(d)} bukan kelipatan 7 → pakai π = 3,14.` }
}

export const circleArea = (r, pi) => PI[pi] * r * r
export const circumference = (r, pi) => 2 * PI[pi] * r
export const blanketArea = (r, t, pi) => 2 * PI[pi] * r * t

export function surfaceArea(r, t, type, pi) {
  if (type === 'closed') return 2 * circleArea(r, pi) + blanketArea(r, t, pi)
  if (type === 'open') return circleArea(r, pi) + blanketArea(r, t, pi)
  return blanketArea(r, t, pi)
}

export function clean(x) {
  return Math.round(x * 1e6) / 1e6
}

/** Format gaya Indonesia: 1.540,5 */
export function fmt(x, decimals = 4) {
  if (x === null || x === undefined || Number.isNaN(x)) return '–'
  const v = Number(Number(x).toFixed(decimals))
  return v.toLocaleString('id-ID', { maximumFractionDigits: decimals })
}

/** Parse input siswa → angka. Menerima "3,5", "3.5", "1.540", "1.540,5". null jika tidak valid. */
export function parseNumber(raw) {
  if (raw === null || raw === undefined) return null
  let s = String(raw).trim().replace(/^rp/i, '').replace(/\s|cm²|cm2|cm|m²|m2|lembar|kaleng|buah/gi, '')
  if (!s || !/^-?[\d.,]+$/.test(s) || !/\d/.test(s)) return null
  const hasDot = s.includes('.')
  const hasComma = s.includes(',')
  if (hasDot && hasComma) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (hasComma) {
    if ((s.match(/,/g) || []).length > 1) return null
    s = s.replace(',', '.')
  } else if (hasDot && (s.match(/\./g) || []).length > 1) {
    if (!/^-?\d{1,3}(\.\d{3})+$/.test(s)) return null
    s = s.replace(/\./g, '')
  }
  const v = Number(s)
  return Number.isFinite(v) ? v : null
}

/** Semua tafsiran wajar dari input ("1.188" bisa 1,188 atau 1188). */
export function numberCandidates(raw) {
  const out = []
  const first = parseNumber(raw)
  if (first !== null) out.push(first)
  const s = String(raw ?? '').trim().replace(/^rp/i, '').replace(/\s|cm²|cm2|cm|m²|m2|lembar|kaleng/gi, '')
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(s)) {
    const v = Number(s.replace(/[.,]/g, ''))
    if (!out.includes(v)) out.push(v)
  }
  return out
}

/** Cocokkan jawaban siswa dengan kunci (toleransi pembulatan kecil). */
export function matchesAnswer(raw, answer, tol) {
  const t = tol ?? Math.max(0.01, Math.abs(answer) * 0.0005)
  return numberCandidates(raw).some((v) => Math.abs(v - answer) <= t)
}

export function validatePositive(raw, label, max = 10000) {
  if (raw === '' || raw === null || raw === undefined) return `${label} belum diisi.`
  const v = parseNumber(raw)
  if (v === null) return `${label} harus berupa angka.`
  if (v <= 0) return `${label} harus lebih dari 0.`
  if (v > max) return `${label} maksimal ${fmt(max)}.`
  return null
}

/** Langkah penyelesaian untuk kalkulator: Diketahui → Rumus → Substitusi → Hasil */
export function solutionSteps({ inputType, value, t, type, pi: piChoice = 'auto' }) {
  const r = inputType === 'd' ? value / 2 : value
  const auto = choosePi(r)
  const pi = piChoice === 'auto' ? auto.pi : piChoice
  const p = PI_LABEL[pi]
  const base = circleArea(r, pi)
  const blanket = blanketArea(r, t, pi)
  const total = surfaceArea(r, t, type, pi)
  const known = inputType === 'd'
    ? `d = ${fmt(value)} cm → r = d ÷ 2 = ${fmt(r)} cm, t = ${fmt(t)} cm`
    : `r = ${fmt(r)} cm, t = ${fmt(t)} cm`
  const subst = {
    closed: `L = 2 × ${p} × ${fmt(r)} × (${fmt(r)} + ${fmt(t)})`,
    open: `L = ${p} × ${fmt(r)}² + 2 × ${p} × ${fmt(r)} × ${fmt(t)}`,
    blanket: `L = 2 × ${p} × ${fmt(r)} × ${fmt(t)}`,
  }[type]
  const detail = {
    closed: `= 2 × ${fmt(base, 2)} + ${fmt(blanket, 2)}`,
    open: `= ${fmt(base, 2)} + ${fmt(blanket, 2)}`,
    blanket: '',
  }[type]
  return {
    r, pi, base, blanket, total,
    steps: [
      { label: 'Diketahui', text: known },
      { label: 'Pilih π', text: piChoice === 'auto' ? auto.reason : `π = ${p} (dipilih manual)` },
      { label: 'Rumus', text: FORMULA[type] },
      { label: 'Substitusi', text: `${subst} ${detail}`.trim() },
      { label: 'Hasil', text: `L = ${fmt(total, 2)} cm²` },
    ],
  }
}

export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
