import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDecimal, parseLocaleNumber } from '../numberFormat.js'

describe('numberFormat helpers', () => {
  it('formatea moneda con separadores locales', () => {
    const formatted = formatCurrency(1500.5)
    expect(formatted).toContain('Bs.')
    expect(formatted).toContain('1.500,50')
  })

  it('formatea decimales', () => {
    expect(formatDecimal(12.345)).toBe('12,35')
  })

  it('convierte texto local a número', () => {
    expect(parseLocaleNumber('1.234,56')).toBeCloseTo(1234.56)
    expect(parseLocaleNumber('2.000')).toBe(2000)
    expect(parseLocaleNumber('abc')).toBe(0)
  })
})
