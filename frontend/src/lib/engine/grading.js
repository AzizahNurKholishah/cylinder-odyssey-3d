// Penilaian langkah jawaban + diagnosis kesalahan umum.
// Port 1:1 dari backend/app/services/numbers.py dan grading.py (mode standalone).
import content from '../../content/generated/content.json'
import { fmt } from '../cylinder.js'

export const ERROR_FEEDBACK = content.error_feedback

const THOUSANDS_DOT = /^-?\d{1,3}(\.\d{3})+$/
const THOUSANDS_COMMA = /^-?\d{1,3}(,\d{3})+$/
const UNIT = /(cm|mm|dm|m)\s*\^?[23²³]?|lembar|kaleng|buah/gi

/** Semua tafsiran wajar dari input siswa ("8.272" bisa 8,272 atau 8272). */
export function parseCandidates(raw) {
  if (raw === null || raw === undefined || typeof raw === 'boolean') return []
  if (typeof raw === 'number') return Number.isFinite(raw) ? [raw] : []
  let s = String(raw).trim()
  if (!s) return []
  s = s.replace(/rp/gi, '').replace(UNIT, '').replace(/[\s ]/g, '')
  if (!/^-?[\d.,]+$/.test(s) || !/\d/.test(s)) return []
  const out = []
  const add = (t) => {
    const v = Number(t)
    if (t !== '' && Number.isFinite(v) && !out.includes(v)) out.push(v)
  }
  const hasDot = s.includes('.')
  const hasComma = s.includes(',')
  const count = (ch) => s.split(ch).length - 1
  if (hasDot && hasComma) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) add(s.replace(/\./g, '').replace(',', '.'))
    else add(s.replace(/,/g, ''))
  } else if (hasComma) {
    if (count(',') === 1) add(s.replace(',', '.'))
    if (THOUSANDS_COMMA.test(s)) add(s.replace(/,/g, ''))
  } else if (hasDot) {
    if (count('.') === 1) add(s)
    if (THOUSANDS_DOT.test(s)) add(s.replace(/\./g, ''))
  } else {
    add(s)
  }
  return out
}

export const defaultTolerance = (target) => Math.max(0.05, Math.abs(target) * 0.0002)

export function matches(cands, target, tolerance) {
  const tol = tolerance ?? defaultTolerance(target)
  return cands.some((c) => Math.abs(c - target) <= tol)
}

const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim()

export function gradeStep(step, raw) {
  const maxPts = step.score ?? 1
  const result = { step_id: step.id, correct: false, points: 0, max_points: maxPts, error_type: null, feedback: '' }
  const set = (o) => Object.assign(result, o)

  if (raw === null || raw === undefined || (typeof raw === 'string' && !raw.trim())) {
    return set({ error_type: 'empty', feedback: ERROR_FEEDBACK.empty })
  }

  if (step.kind === 'choice') {
    if (String(raw) === step.answer) return set({ correct: true, points: maxPts, feedback: 'Tepat!' })
    const chosen = step.options.find((o) => o.id === String(raw))
    if (!chosen) return set({ error_type: 'invalid_input', feedback: ERROR_FEEDBACK.invalid_input })
    const err = chosen.error_type || 'concept'
    return set({ error_type: err, feedback: ERROR_FEEDBACK[err] || ERROR_FEEDBACK.concept })
  }

  if (step.kind === 'number') {
    const cands = parseCandidates(raw)
    if (!cands.length) return set({ error_type: 'invalid_input', feedback: ERROR_FEEDBACK.invalid_input })
    const tol = step.tolerance
    if (matches(cands, step.answer, tol)) return set({ correct: true, points: maxPts, feedback: 'Tepat!' })
    for (const e of step.errors || []) {
      if (matches(cands, e.value, tol)) return set({ error_type: e.error_type, feedback: ERROR_FEEDBACK[e.error_type] || '' })
    }
    return set({ error_type: 'calculation', feedback: ERROR_FEEDBACK.calculation })
  }

  if (step.kind === 'text') {
    const text = norm(String(raw))
    let pts = 0
    for (const g of step.keywords || []) if (g.any.some((w) => text.includes(norm(w)))) pts += g.points
    pts = Math.min(pts, maxPts)
    if (pts >= maxPts) return set({ correct: true, points: pts, feedback: 'Alasanmu lengkap.' })
    if (pts > 0) return set({ points: pts, error_type: 'partial_reason', feedback: ERROR_FEEDBACK.partial_reason })
    return set({ error_type: 'concept', feedback: 'Alasan belum menjelaskan hasil perhitungan.' })
  }
  throw new Error(`kind tidak dikenal: ${step.kind}`)
}

export function gradeQuestion(question, answers = {}) {
  const results = question.steps.map((s) => gradeStep(s, answers?.[s.id]))
  return {
    is_correct: results.every((r) => r.correct),
    score: results.reduce((n, r) => n + r.points, 0),
    max_score: results.reduce((n, r) => n + r.max_points, 0),
    error_type: results.find((r) => !r.correct)?.error_type ?? null,
    step_results: results,
  }
}

export function stepAnswerText(step) {
  if (step.kind === 'number') {
    if (step.unit === 'Rp') return `Rp${fmt(step.answer)}`
    return `${fmt(step.answer)} ${step.unit || ''}`.trim()
  }
  if (step.kind === 'choice') return step.options.find((o) => o.id === step.answer).text
  return step.model_answer || ''
}

export const correctAnswers = (q) => Object.fromEntries(q.steps.map((s) => [s.id, stepAnswerText(s)]))

const SECRET = new Set(['answer', 'errors', 'keywords', 'model_answer', 'tolerance'])

/** Versi soal tanpa kunci jawaban (ditampilkan selama siswa mengerjakan). */
export function sanitizeQuestion(q, includeHints = true) {
  const steps = q.steps.map((s) => {
    const out = Object.fromEntries(Object.entries(s).filter(([k]) => !SECRET.has(k)))
    if (out.options) out.options = out.options.map((o) => ({ id: o.id, text: o.text }))
    return out
  })
  const out = { id: q.id, title: q.title, story_text: q.story_text || '', highlights: q.highlights || [], steps, max_score: q.max_score }
  for (const k of ['category', 'difficulty', 'question_type', 'cylinder_type', 'indicator']) if (k in q) out[k] = q[k]
  if (includeHints) out.hints = q.hints || []
  return out
}
