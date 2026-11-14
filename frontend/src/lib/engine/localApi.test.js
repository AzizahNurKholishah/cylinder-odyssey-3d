// Skenario yang sama dengan backend/tests/test_api.py → memastikan mode standalone identik.
import { beforeEach, describe, expect, it } from 'vitest'
import content from '../../content/generated/content.json'
import { gradeStep, parseCandidates } from './grading.js'
import { localAPI as api, resetLocalDb, setLocalToken, TEACHER_ACCESS_KEY, validateName } from './localApi.js'

const FULL = {
  'LIT-1': { r_b: '3,5', lp_a: '748', lp_b: '957', pilih: 'a', alasan: 'Desain A lebih hemat karena luasnya 748 cm² lebih kecil dari 957 cm².' },
  'LIT-2': { model: 'a', r: '28', lp_satu: '16544', lp_total: '82720', lp_m2: '8,272', cukup: 'a' },
  'LIT-3': { tutup: '154', selimut: '660', total: '814', biaya: 'Rp48.840' },
  'LIT-4': { lp_satu: '5632', lp_total: '33792', lembar: '6,76', klaim: 'a', beli: '7', alasan: 'Kalau beli 6 lembar sengnya kurang, jadi dibulatkan ke atas.' },
}

/** Masuk sebagai siswa dengan nama bebas. */
async function login(name = 'Budi Santoso') {
  const r = await api.loginStudent(name)
  setLocalToken(r.token)
  return r
}
async function loginTeacher() {
  const r = await api.login('GURU-01', TEACHER_ACCESS_KEY)
  setLocalToken(r.token)
  return r
}
const err = (p) => p.then(() => { throw new Error('harusnya gagal') }, (e) => e)
const q = (id) => content.questions.find((x) => x.id === id)
const step = (id, sid) => q(id).steps.find((s) => s.id === sid)

beforeEach(() => { resetLocalDb(); setLocalToken(null) })

describe('masuk dengan nama bebas', () => {
  it.each([
    ['', 'empty_name'],
    ['   ', 'empty_name'],
    ['A', 'name_too_short'],
    ['12', 'name_too_short'],
    ['B7', 'name_too_short'],
    ['x'.repeat(41), 'name_too_long'],
    ['<script>', 'invalid_name'],
    ['Budi;DROP', 'invalid_name'],
  ])('nama tidak valid %j → %s', async (name, code) => {
    expect((await err(api.loginStudent(name))).code).toBe(code)
    expect(validateName(name).code).toBe(code)
  })

  it.each(['Al', 'Budi Santoso', "Nur'aini", 'Siti Nurhaliza Putri', 'Ahmad 2', 'Dewi-Lestari', 'Élodie'])('nama valid %j', async (name) => {
    expect(validateName(name)).toBeNull()
    const r = await api.loginStudent(name)
    expect(r.profile.role).toBe('student')
    expect(r.profile.full_name).toBe(name)
  })

  it('nama baru → profil baru dengan XP 0 dan progres awal', async () => {
    const r = await login('Budi Santoso')
    expect(r.is_new).toBe(true)
    const d = await api.dashboard()
    expect(d.profile.full_name).toBe('Budi Santoso')
    expect(d.stats.xp).toBe(0)
    expect(d.progress_percent).toBe(0)
    expect(d.lessons[0].is_unlocked).toBe(true)
    expect(d.lessons[1].is_unlocked).toBe(false)
  })

  it('nama yang sama memuat kembali progres (abaikan huruf besar/kecil & spasi)', async () => {
    await login('Budi Santoso')
    await api.completeLesson('lembah-lingkaran')
    setLocalToken(null)
    for (const variant of ['Budi Santoso', 'budi santoso', '  BUDI   santoso  ']) {
      const r = await login(variant)
      expect(r.is_new).toBe(false)
      expect(r.profile.full_name).toBe('Budi Santoso')
      expect((await api.dashboard()).stats.xp).toBe(50)
    }
  })

  it('nama berbeda = siswa berbeda', async () => {
    await login('Budi Santoso')
    await api.completeLesson('lembah-lingkaran')
    expect((await login('Budi Santosa')).is_new).toBe(true)
    expect((await api.dashboard()).stats.xp).toBe(0)
  })

  it('kode SMP8-xx tidak diperlukan lagi', async () => {
    expect((await err(api.login('SMP8-01'))).code).toBe('not_registered')
  })

  it('akun guru tetap memakai kode + access key', async () => {
    expect((await err(api.login('GURU-01'))).code).toBe('access_key_required')
    expect((await err(api.login('GURU-01', 'salah'))).code).toBe('invalid_access_key')
    expect((await err(api.login(''))).code).toBe('empty_code')
    expect((await api.login(' guru-01 ', TEACHER_ACCESS_KEY)).profile.role).toBe('teacher')
  })

  it('halaman privat butuh sesi', async () => {
    expect((await err(api.dashboard())).status).toBe(401)
  })
})

describe('materi & XP', () => {
  it('level berurutan, XP idempoten, lencana', async () => {
    await login()
    expect((await err(api.completeLesson('bengkel-jaring'))).code).toBe('lesson_locked')
    const r1 = await api.completeLesson('lembah-lingkaran')
    const r2 = await api.completeLesson('lembah-lingkaran')
    expect(r1.xp_awarded).toBe(50)
    expect(r2.xp_awarded).toBe(0)
    expect(r1.new_badges.map((b) => b.code)).toEqual(['circle_guardian'])
    const d = await api.dashboard()
    expect(d.stats.xp).toBe(50)
    expect(d.lessons[1].is_unlocked).toBe(true)
    expect(d.recommendation.route).toBe('/lesson/bengkel-jaring')
  })
  it('data tiap siswa terpisah', async () => {
    await login('Siti')
    await api.completeLesson('lembah-lingkaran')
    await login('Andi')
    expect((await api.dashboard()).stats.xp).toBe(0)
  })
})

describe('latihan', () => {
  it('tanpa kunci, diagnosis, hint, pembahasan, XP sekali', async () => {
    await login()
    const { question } = await api.practiceQuestion('TZ-I02')
    expect(JSON.stringify(question)).not.toMatch(/"answer"|"errors"/)
    expect(question.hints).toHaveLength(3)

    const wrong = await api.practiceAttempt('TZ-I02', { answers: { r: '60', lp: '1', unit: 'a' }, hints_used: 1 })
    expect(wrong.is_correct).toBe(false)
    expect(wrong.error_type).toBe('diameter_as_radius')
    expect(wrong.explanation).toBeNull()

    const rev = await api.practiceAttempt('TZ-I02', { answers: {}, hints_used: 3, reveal: true })
    expect(rev.correct_answers.lp).toBe('22.608 cm²')

    const ok = await api.practiceAttempt('TZ-I02', { answers: { r: '30', lp: '22.608', unit: 'a' }, hints_used: 0 })
    expect(ok.is_correct).toBe(true)
    expect(ok.xp_awarded).toBe(25)
    expect((await api.practiceAttempt('TZ-I02', { answers: { r: '30', lp: '22608', unit: 'a' } })).xp_awarded).toBe(0)
    expect((await api.saveReflection(ok.attempt_id, 'Karena tertutup.')).ok).toBe(true)
  })

  it.each([
    ['TZ-I02', 'r', '60', 'diameter_as_radius'],
    ['TZ-I02', 'lp', '56520', 'diameter_as_radius'],
    ['TZ-I03', 'lp', '297', 'closed_instead_of_open'],
    ['TZ-I01', 'lp', '682', 'open_instead_of_closed'],
    ['TZ-I01', 'lp', '528', 'blanket_only'],
    ['TZ-I01', 'lp', '835.24', 'wrong_pi'],
    ['TZ-E04', 'lembar', '2', 'rounding_down'],
    ['TZ-E01', 'm2', '225,28', 'unit_conversion'],
    ['TZ-B05', 'ls', '220', 'forgot_two'],
  ])('deteksi %s/%s = %s → %s', (id, sid, ans, type) => {
    const r = gradeStep(step(id, sid), ans)
    expect(r.correct).toBe(false)
    expect(r.error_type).toBe(type)
  })

  it('parser angka sama dengan backend', () => {
    expect(parseCandidates('8,272')).toEqual([8.272, 8272])
    expect(parseCandidates('Rp48.840')).toEqual([48.84, 48840])
    expect(parseCandidates('1.540,5 cm²')).toEqual([1540.5])
    expect(parseCandidates('7 lembar')).toEqual([7])
    expect(parseCandidates('abc')).toEqual([])
  })

  it('lencana Hint-Free Solver', async () => {
    await login()
    const answers = { 'TZ-B01': { r: 'a' }, 'TZ-B02': { tf: 'salah' }, 'TZ-B03': { shape: 'a' }, 'TZ-B06': { tf: 'benar' }, 'TZ-B07': { pi: 'a' } }
    const badges = []
    for (const [id, a] of Object.entries(answers)) {
      const r = await api.practiceAttempt(id, { answers: a })
      expect(r.is_correct).toBe(true)
      badges.push(...r.new_badges.map((b) => b.code))
    }
    expect(badges).toContain('hint_free_solver')
  })
})

describe('Final Challenge', () => {
  it('skor penuh 24', async () => {
    await login()
    const qs = await api.evaluationQuestions()
    expect(qs.questions).toHaveLength(4)
    expect(JSON.stringify(qs)).not.toMatch(/model_answer|"answer"/)
    const r = await api.submitEvaluation(FULL)
    expect(r.total_score).toBe(24)
    expect(r.scores).toEqual({ reasoning: 6, formulating: 6, employing: 6, evaluating: 6 })
    expect(r.new_badges.map((b) => b.code)).toContain('literacy_champion')
    expect((await api.latestEvaluation()).result.total_score).toBe(24)
  })
  it('skor parsial per tahap', async () => {
    await login()
    const r = await api.submitEvaluation({
      'LIT-1': { r_b: '3.5', lp_a: '748', lp_b: '1000', pilih: 'b', alasan: 'pokoknya' },
      'LIT-3': { tutup: '154', selimut: '660', total: '968', biaya: '1' },
      'LIT-4': { lp_satu: '5632', lp_total: '33792', lembar: '6,76', klaim: 'b', beli: '6', alasan: 'dibulatkan saja' },
    })
    expect(r.scores).toEqual({ reasoning: 2, formulating: 0, employing: 3, evaluating: 3 })
    expect(r.total_score).toBe(8)
    expect(r.detail['LIT-3'].steps[2].error_type).toBe('closed_instead_of_open')
    expect(r.detail['LIT-4'].steps[4].error_type).toBe('rounding_down')
  })
})

describe('game, lab, profil, guru', () => {
  it('game & lencana Playground Explorer', async () => {
    await login()
    for (const s of ['part-detector', 'radius-pi-sprint', 'net-matcher', 'formula-builder']) {
      expect((await api.submitGame(s, 80)).xp_awarded).toBe(40)
    }
    const r = await api.submitGame('cylinder-quest', 50)
    expect(r.xp_awarded).toBe(15)
    expect(r.new_badges[0].code).toBe('playground_explorer')
    expect((await err(api.submitGame('net-matcher', 101))).status).toBe(422)
    expect((await api.games()).games[0].best_score).toBe(80)
  })
  it('lab & profil', async () => {
    await login()
    const lab = await api.labExplored('unfold')
    expect(lab.xp_awarded).toBe(20)
    expect(lab.new_badges[0].code).toBe('net_unfolder')
    await api.submitEvaluation(FULL)
    const p = await api.profile()
    expect(p.best_evaluation.total_score).toBe(24)
    expect(p.history.length).toBeGreaterThan(0)
  })
  it('panel guru melihat siswa yang masuk di perangkat ini', async () => {
    await login('Budi Santoso')
    expect((await err(api.adminStudents())).status).toBe(403)
    await api.submitEvaluation(FULL)
    await login('Andi')
    await loginTeacher()
    const list = (await api.adminStudents()).students
    expect(list.map((s) => s.full_name)).toEqual(['Andi', 'Budi Santoso'])
    const budi = list.find((s) => s.full_name === 'Budi Santoso')
    expect(budi.latest_literacy_total).toBe(24)
    expect(list.find((s) => s.full_name === 'Andi').total_xp).toBe(0)
  })
})
