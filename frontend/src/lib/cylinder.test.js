import { describe, expect, it } from 'vitest'
import { choosePi, clean, fmt, matchesAnswer, parseNumber, solutionSteps, surfaceArea, validatePositive } from './cylinder.js'

describe('rumus tabung', () => {
  it('menghitung luas permukaan', () => {
    expect(clean(surfaceArea(7, 10, 'closed', '22/7'))).toBe(748)
    expect(clean(surfaceArea(7, 10, 'open', '22/7'))).toBe(594)
    expect(clean(surfaceArea(7, 10, 'blanket', '22/7'))).toBe(440)
    expect(clean(surfaceArea(30, 90, 'closed', '3.14'))).toBe(22608)
  })
  it('memilih π', () => {
    expect(choosePi(7).pi).toBe('22/7')
    expect(choosePi(3.5).pi).toBe('22/7')
    expect(choosePi(10).pi).toBe('3.14')
  })
  it('langkah kalkulator dari diameter', () => {
    const s = solutionSteps({ inputType: 'd', value: 14, t: 10, type: 'closed' })
    expect(s.r).toBe(7)
    expect(clean(s.total)).toBe(748)
    expect(s.steps.map((x) => x.label)).toEqual(['Diketahui', 'Pilih π', 'Rumus', 'Substitusi', 'Hasil'])
  })
})

describe('input angka', () => {
  it('parse format Indonesia', () => {
    expect(parseNumber('3,5')).toBe(3.5)
    expect(parseNumber('1.540')).toBe(1.54)
    expect(parseNumber('1.540.000')).toBe(1540000)
    expect(parseNumber('1.540,5')).toBe(1540.5)
    expect(parseNumber('836 cm²')).toBe(836)
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('')).toBeNull()
  })
  it('mencocokkan jawaban ambigu', () => {
    expect(matchesAnswer('96.800', 96800)).toBe(true)
    expect(matchesAnswer('3,96', 3.96)).toBe(true)
    expect(matchesAnswer('3.96', 3.96)).toBe(true)
    expect(matchesAnswer('1.188 cm²', 1188)).toBe(true)
    expect(matchesAnswer('7', 14)).toBe(false)
  })
  it('validasi', () => {
    expect(validatePositive('', 'r')).toMatch(/belum/)
    expect(validatePositive('0', 'r')).toMatch(/lebih dari 0/)
    expect(validatePositive('-2', 'r')).toMatch(/lebih dari 0/)
    expect(validatePositive('x', 'r')).toMatch(/angka/)
    expect(validatePositive('7', 'r')).toBeNull()
  })
  it('format', () => {
    expect(fmt(22608)).toBe('22.608')
    expect(fmt(258.5)).toBe('258,5')
  })
})
