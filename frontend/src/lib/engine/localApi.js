// Mode STANDALONE: seluruh logika backend berjalan di perangkat siswa.
// Progres disimpan di localStorage (per perangkat, per kode siswa).
// Bentuk respons identik dengan API FastAPI sehingga halaman tidak perlu tahu bedanya.
import content from '../../content/generated/content.json'
import { correctAnswers, gradeQuestion, sanitizeQuestion, stepAnswerText } from './grading.js'

const { lessons: LESSONS, games: GAMES, achievements: ACHIEVEMENTS, indicators: INDICATORS, rules: R } = content
const QUESTIONS = content.questions
const QUESTIONS_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]))
const LITERACY = content.literacy
const CODE_PATTERN = /^[A-Z0-9]{2,8}-[A-Z0-9]{1,6}$/
const DB_KEY = 'co3d_local_db_v1'
export const TEACHER_ACCESS_KEY = import.meta.env?.VITE_TEACHER_ACCESS_KEY || 'guru-tabung-2026'

export class LocalApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}
const fail = (status, code, message) => { throw new LocalApiError(status, code, message) }

// ------------------------------------------------------------------ penyimpanan
let memoryFallback = null
function load() {
  try {
    const raw = globalThis.localStorage?.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage diblokir/rusak */ }
  return memoryFallback || { extraProfiles: [], users: {} }
}
function save(db) {
  memoryFallback = db
  try { globalThis.localStorage?.setItem(DB_KEY, JSON.stringify(db)) } catch { /* penuh/diblokir: tetap di memori */ }
}
export function resetLocalDb() {
  memoryFallback = null
  try { globalThis.localStorage?.removeItem(DB_KEY) } catch { /* abaikan */ }
}

const now = () => new Date().toISOString()
const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
const clone = (x) => JSON.parse(JSON.stringify(x))
const normalizeCode = (raw) => String(raw || '').trim().toUpperCase().replace(/\s/g, '')

function allProfiles(db) {
  const base = content.profiles.map((p) => ({ ...p, id: p.student_code, created_at: null }))
  return [...base, ...db.extraProfiles]
}
const publicProfile = (p) => ({ id: p.id, student_code: p.student_code, full_name: p.full_name, class_name: p.class_name, role: p.role })

function userData(db, id) {
  if (!db.users[id]) db.users[id] = { lessons: {}, practice: [], games: [], evaluations: [], logs: [], achievements: {} }
  return db.users[id]
}

// ------------------------------------------------------------------ sesi
const SESSION_PREFIX = 'local:'
let currentToken = null
export const setLocalToken = (t) => { currentToken = t }

function currentUser(db, token) {
  const t = token ?? currentToken
  if (!t || !t.startsWith(SESSION_PREFIX)) fail(401, 'not_authenticated', 'Silakan masuk terlebih dahulu.')
  const code = t.slice(SESSION_PREFIX.length)
  const p = allProfiles(db).find((x) => x.student_code === code)
  if (!p) fail(401, 'invalid_token', 'Akun tidak ditemukan. Silakan masuk kembali.')
  return p
}

// ------------------------------------------------------------------ gamifikasi
export function levelInfo(xp) {
  let level = 1
  R.level_thresholds.forEach((t, i) => { if (xp >= t) level = i + 1 })
  const i = level - 1
  return { level, title: R.level_titles[i], xp, level_start: R.level_thresholds[i], next_level_at: R.level_thresholds[i + 1] ?? null }
}
const practiceXp = (difficulty, hints) => 10 * difficulty + (hints === 0 ? 5 : 0)

function awardXp(u, key, xp, type, title, score = null) {
  if (u.logs.some((l) => l.xp_key === key)) return 0
  u.logs.push({ activity_type: type, activity_title: title, score_earned: score, xp_earned: xp, xp_key: key, created_at: now() })
  return xp
}
function logActivity(u, type, title, score = null) {
  u.logs.push({ activity_type: type, activity_title: title, score_earned: score, xp_earned: 0, xp_key: null, created_at: now() })
}

function context(u) {
  const xpKeys = new Set(u.logs.map((l) => l.xp_key).filter(Boolean))
  const correct = new Set(u.practice.filter((a) => a.is_correct).map((a) => a.question_id))
  const hintFree = new Set(u.practice.filter((a) => a.is_correct && a.hints_used === 0).map((a) => a.question_id))
  const gamesPlayed = new Set(u.games.map((g) => g.game_id))
  const lessonDone = (slug) => Boolean(u.lessons[LESSONS.find((l) => l.slug === slug).id])
  const missions = [
    ...LESSONS.map((l) => ({ code: `lesson:${l.slug}`, title: `Level 0${l.level_number} — ${l.title}`, route: `/lesson/${l.slug}`, done: lessonDone(l.slug) })),
    { code: 'lab', title: 'Bentangkan jaring-jaring di Cylinder Laboratory', route: '/lab', done: xpKeys.has('lab:unfold') },
    { code: 'training', title: `Jawab benar ${R.training_mission_target} soal di Training Zone`, route: '/training', done: correct.size >= R.training_mission_target },
    { code: 'playground', title: 'Mainkan kelima mini games', route: '/playground', done: gamesPlayed.size >= GAMES.length },
    { code: 'final', title: 'Selesaikan Final Challenge', route: '/final', done: u.evaluations.length > 0 },
  ]
  const earned = new Set()
  if (lessonDone('lembah-lingkaran')) earned.add('circle_guardian')
  if (xpKeys.has('lab:unfold')) earned.add('net_unfolder')
  if (lessonDone('bengkel-jaring')) earned.add('formula_architect')
  if (lessonDone('benteng-terbuka')) earned.add('open_top_specialist')
  if (hintFree.size >= R.hint_free_target) earned.add('hint_free_solver')
  if (gamesPlayed.size >= GAMES.length) earned.add('playground_explorer')
  if (u.evaluations.length) earned.add('literacy_champion')
  const totalXp = u.logs.reduce((n, l) => n + (l.xp_earned || 0), 0)
  return { missions, earned, correct, hintFree, totalXp }
}

/** Buka lencana baru yang sudah memenuhi syarat. */
function refresh(u) {
  const ctx = context(u)
  const newBadges = []
  for (const a of ACHIEVEMENTS) {
    if (ctx.earned.has(a.code) && !u.achievements[a.id]) {
      u.achievements[a.id] = now()
      newBadges.push({ code: a.code, title: a.title, description: a.description, icon_name: a.icon_name })
    }
  }
  return { ctx, newBadges }
}

function lessonStatus(u) {
  const sorted = [...LESSONS].sort((a, b) => a.order_index - b.order_index)
  return sorted.map((l, i) => ({ ...l, is_unlocked: i === 0 || Boolean(u.lessons[sorted[i - 1].id]), is_completed: Boolean(u.lessons[l.id]) }))
}

const newestFirst = (arr, key) => [...arr].sort((a, b) => (a[key] < b[key] ? 1 : -1))
const activity = (l) => ({ type: l.activity_type, title: l.activity_title, score: l.score_earned, xp: l.xp_earned || 0, created_at: l.created_at })
const evalSummary = (e) => e && ({ id: e.id, completed_at: e.completed_at, total_score: e.total_score, scores: { ...e.scores } })

function dashboard(p, u) {
  const { ctx } = refresh(u)
  const lessons = lessonStatus(u)
  const done = ctx.missions.filter((m) => m.done).length
  const next = lessons.find((l) => l.is_unlocked && !l.is_completed)
  let rec
  if (next) rec = { title: `Lanjutkan Level 0${next.level_number} — ${next.title}`, route: `/lesson/${next.slug}` }
  else {
    const m = ctx.missions.find((x) => !x.done)
    rec = m ? { title: m.title, route: m.route } : { title: 'Semua misi selesai! Ulangi Final Challenge untuk skor terbaik.', route: '/final' }
  }
  const evals = newestFirst(u.evaluations, 'completed_at')
  return {
    profile: publicProfile(p),
    stats: { ...levelInfo(ctx.totalXp), missions_completed: done, missions_total: ctx.missions.length },
    progress_percent: Math.round((100 * done) / ctx.missions.length),
    missions: ctx.missions,
    lessons,
    badges: ACHIEVEMENTS.map((a) => ({ code: a.code, title: a.title, description: a.description, icon_name: a.icon_name, unlocked: Boolean(u.achievements[a.id]), unlocked_at: u.achievements[a.id] ?? null })),
    recent_activities: newestFirst(u.logs, 'created_at').slice(0, 6).map(activity),
    recommendation: rec,
    latest_evaluation: evalSummary(evals[0]) ?? null,
  }
}

function evalPayload(e) {
  return {
    id: e.id, completed_at: e.completed_at, scores: { ...e.scores }, total_score: e.total_score, max_total: 24,
    indicators: INDICATORS, detail: e.detail,
    explanations: Object.fromEntries(LITERACY.map((q) => [q.id, { title: q.title, explanation: q.explanation }])),
  }
}

/** Skor parsial per tahap → skor per indikator (0–6) dan total (0–24). */
export function scoreEvaluation(answers) {
  const scores = Object.fromEntries(Object.keys(INDICATORS).map((k) => [k, 0]))
  const detail = {}
  for (const q of LITERACY) {
    const given = answers?.[q.id] || {}
    const g = gradeQuestion(q, given)
    scores[q.indicator] = g.score
    detail[q.id] = {
      indicator: q.indicator, score: g.score, max_score: g.max_score,
      steps: q.steps.map((s, i) => ({ ...g.step_results[i], prompt: s.prompt, student_answer: String(given[s.id] ?? '').slice(0, 1000), correct_answer: stepAnswerText(s) })),
    }
  }
  return { scores, total: Object.values(scores).reduce((a, b) => a + b, 0), detail }
}

// ------------------------------------------------------------------ API publik
/** Jalankan aksi terhadap DB lokal lalu simpan. Hasil selalu salinan (bukan referensi). */
function tx(fn, { auth = true, write = false } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const db = load()
      const p = auth ? currentUser(db) : null
      const u = p ? userData(db, p.id) : null
      const out = fn({ db, p, u })
      if (write || u) save(db)
      resolve(clone(out))
    } catch (e) {
      reject(e)
    }
  })
}

export const localAPI = {
  login: (code, accessKey) => tx(({ db }) => {
    const c = normalizeCode(code)
    if (!c) fail(400, 'empty_code', 'Kode siswa belum diisi.')
    if (!CODE_PATTERN.test(c)) fail(400, 'invalid_format', 'Format kode tidak valid. Contoh: SMP8-01.')
    const p = allProfiles(db).find((x) => x.student_code === c)
    if (!p) fail(404, 'not_registered', 'Kode siswa tidak terdaftar. Tanyakan kodemu kepada guru.')
    if (p.role === 'teacher') {
      if (!accessKey) fail(401, 'access_key_required', 'Akun guru membutuhkan access key.')
      if (accessKey !== TEACHER_ACCESS_KEY) fail(401, 'invalid_access_key', 'Access key guru salah.')
    }
    return { token: SESSION_PREFIX + p.student_code, profile: publicProfile(p) }
  }, { auth: false }),

  me: () => tx(({ p }) => ({ profile: publicProfile(p) })),
  dashboard: () => tx(({ p, u }) => dashboard(p, u)),

  profile: () => tx(({ p, u }) => {
    const data = dashboard(p, u)
    const ctx = context(u)
    const evals = newestFirst(u.evaluations, 'completed_at').map(evalSummary)
    const best = evals.length ? evals.reduce((a, b) => (b.total_score > a.total_score ? b : a)) : null
    return {
      ...data,
      indicators: INDICATORS,
      evaluations: evals,
      best_evaluation: best,
      practice_summary: {
        attempts: u.practice.length,
        questions_correct: ctx.correct.size,
        hints_used_total: u.practice.reduce((n, a) => n + (a.hints_used || 0), 0),
        hint_free_correct: ctx.hintFree.size,
      },
      game_summary: Object.fromEntries(GAMES.map((g) => {
        const s = u.games.filter((a) => a.game_id === g.id).map((a) => a.score)
        return [g.slug, { title: g.title, best: s.length ? Math.max(...s) : null, plays: s.length }]
      })),
      history: newestFirst(u.logs, 'created_at').slice(0, 50).map(activity),
    }
  }),

  lessons: () => tx(({ u }) => ({ lessons: lessonStatus(u) })),
  completeLesson: (slug) => tx(({ u }) => {
    const l = lessonStatus(u).find((x) => x.slug === slug)
    if (!l) fail(404, 'lesson_not_found', 'Level tidak ditemukan.')
    if (!l.is_unlocked) fail(403, 'lesson_locked', 'Selesaikan level sebelumnya terlebih dahulu.')
    if (!u.lessons[l.id]) u.lessons[l.id] = now()
    const xp = awardXp(u, `lesson:${slug}`, R.xp_lesson, 'lesson', `Menyelesaikan Level 0${l.level_number} — ${l.title}`)
    const { ctx, newBadges } = refresh(u)
    return { ok: true, xp_awarded: xp, new_badges: newBadges, total_xp: ctx.totalXp }
  }),

  practiceList: () => tx(({ u }) => ({
    questions: QUESTIONS.map((q) => {
      const mine = u.practice.filter((a) => a.question_id === q.id)
      return { id: q.id, title: q.title, difficulty: q.difficulty, question_type: q.question_type, cylinder_type: q.cylinder_type, category: q.category, attempts: mine.length, solved: mine.some((a) => a.is_correct) }
    }),
  })),
  practiceQuestion: (id) => tx(() => {
    const q = QUESTIONS_BY_ID[id] || fail(404, 'question_not_found', 'Soal tidak ditemukan.')
    return { question: sanitizeQuestion(q) }
  }),
  practiceAttempt: (id, { answers = {}, hints_used = 0, reveal = false } = {}) => tx(({ u }) => {
    const q = QUESTIONS_BY_ID[id] || fail(404, 'question_not_found', 'Soal tidak ditemukan.')
    const hints = Math.max(0, Math.min(3, Number(hints_used) || 0))
    const g = gradeQuestion(q, answers)
    const attempt = {
      id: uid(), question_id: id, is_correct: g.is_correct, hints_used: hints, error_type: g.error_type,
      reflection_text: null, answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, String(v).slice(0, 500)])), created_at: now(),
    }
    u.practice.push(attempt)
    const xp = g.is_correct ? awardXp(u, `practice:${id}`, practiceXp(q.difficulty, hints), 'practice', `Latihan: ${q.title}`, g.score) : 0
    const { newBadges } = refresh(u)
    const show = g.is_correct || (reveal && hints >= 3)
    return { attempt_id: attempt.id, ...g, xp_awarded: xp, new_badges: newBadges, explanation: show ? q.explanation : null, correct_answers: show ? correctAnswers(q) : null }
  }),
  saveReflection: (attemptId, text) => tx(({ u }) => {
    const a = u.practice.find((x) => x.id === attemptId) || fail(404, 'attempt_not_found', 'Percobaan tidak ditemukan.')
    const t = String(text || '').trim()
    if (!t || t.length > 1000) fail(422, 'validation_error', 'Refleksi harus 1–1000 karakter.')
    a.reflection_text = t
    return { ok: true }
  }),

  evaluationQuestions: () => tx(() => ({ indicators: INDICATORS, questions: LITERACY.map((q) => sanitizeQuestion(q, false)) })),
  submitEvaluation: (answers) => tx(({ u }) => {
    const r = scoreEvaluation(answers)
    const row = { id: uid(), scores: r.scores, total_score: r.total, detail: r.detail, completed_at: now() }
    u.evaluations.push(row)
    const title = `Final Challenge — skor ${r.total}/24`
    const xp = awardXp(u, 'eval:first', Math.trunc(20 + r.total * 5), 'evaluation', title, r.total)
    if (xp === 0) logActivity(u, 'evaluation', `${title} (ulang)`, r.total)
    const { newBadges } = refresh(u)
    return { ...evalPayload(row), xp_awarded: xp, new_badges: newBadges }
  }),
  latestEvaluation: () => tx(({ u }) => {
    const e = newestFirst(u.evaluations, 'completed_at')[0]
    return { result: e ? evalPayload(e) : null }
  }),

  games: () => tx(({ u }) => ({
    games: GAMES.map((g) => {
      const s = u.games.filter((a) => a.game_id === g.id).map((a) => a.score)
      return { ...g, best_score: s.length ? Math.max(...s) : null, plays: s.length }
    }),
  })),
  submitGame: (slug, score) => tx(({ u }) => {
    const g = GAMES.find((x) => x.slug === slug) || fail(404, 'game_not_found', 'Game tidak ditemukan.')
    if (!Number.isInteger(score) || score < 0 || score > 100) fail(422, 'validation_error', 'Skor harus 0–100.')
    u.games.push({ game_id: g.id, score, played_at: now() })
    const title = `Bermain ${g.title} — skor ${score}`
    let xp = awardXp(u, `game:${slug}:play`, R.xp_game_first, 'game', title, score)
    if (score >= R.game_mastery_score) xp += awardXp(u, `game:${slug}:mastery`, R.xp_game_mastery, 'game', `Menguasai ${g.title} (skor ≥ ${R.game_mastery_score})`, score)
    if (xp === 0) logActivity(u, 'game', title, score)
    const { newBadges } = refresh(u)
    return { ok: true, xp_awarded: xp, new_badges: newBadges }
  }),

  labExplored: (feature) => tx(({ u }) => {
    if (feature !== 'unfold') fail(422, 'validation_error', 'Fitur tidak dikenal.')
    const xp = awardXp(u, 'lab:unfold', R.xp_lab_unfold, 'lab', 'Membentangkan jaring-jaring tabung 3D')
    const { newBadges } = refresh(u)
    return { ok: true, xp_awarded: xp, new_badges: newBadges }
  }),

  adminStudents: () => tx(({ db, p }) => {
    if (p.role !== 'teacher') fail(403, 'forbidden', 'Halaman ini khusus guru.')
    const students = allProfiles(db).filter((x) => x.role === 'student').sort((a, b) => a.student_code.localeCompare(b.student_code))
    return {
      students: students.map((s) => {
        const u = db.users[s.id]
        const ctx = u ? context(u) : null
        const ev = u ? newestFirst(u.evaluations, 'completed_at')[0] : null
        return { ...publicProfile(s), created_at: s.created_at, total_xp: ctx?.totalXp ?? 0, missions_completed: ctx ? ctx.missions.filter((m) => m.done).length : 0, latest_literacy_total: ev ? ev.total_score : null }
      }),
    }
  }),
  adminCreateStudent: ({ student_code, full_name = '', class_name = 'VIII' }) => tx(({ db, p }) => {
    if (p.role !== 'teacher') fail(403, 'forbidden', 'Halaman ini khusus guru.')
    const code = normalizeCode(student_code)
    if (!CODE_PATTERN.test(code)) fail(400, 'invalid_format', 'Format kode tidak valid. Contoh: SMP8-31.')
    if (allProfiles(db).some((x) => x.student_code === code)) fail(409, 'duplicate_code', 'Kode siswa sudah terdaftar.')
    const row = { id: code, student_code: code, full_name: full_name.trim() || `Siswa ${code}`, class_name: class_name.trim() || 'VIII', role: 'student', created_at: now() }
    db.extraProfiles.push(row)
    return { student: publicProfile(row) }
  }, { write: true }),
}
