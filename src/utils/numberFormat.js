const LOCALE = 'es-VE'

const CURRENCY_SYMBOL = 'Bs.'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'VES',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const decimalFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export const formatCurrency = (value = 0) => {
  const safeValue = Number.isFinite(value) ? value : 0
  const formatted = currencyFormatter.format(safeValue)
  const withSymbol = formatted.replace(/Bs(?:\.S)?/g, CURRENCY_SYMBOL)
  const safeSpacing = withSymbol.replace(new RegExp(`${CURRENCY_SYMBOL.replace('.', '\\.')}(\s*)`, 'g'), `${CURRENCY_SYMBOL} `)
  return safeSpacing.replace(/\s{2,}/g, ' ').trim()
}

export const formatDecimal = (value = 0) => {
  const safeValue = Number.isFinite(value) ? value : 0
  return decimalFormatter.format(safeValue)
}

export const formatInteger = (value = 0) => {
  const safeValue = Number.isFinite(value) ? value : 0
  return integerFormatter.format(safeValue)
}

export const parseLocaleNumber = (input) => {
  if (typeof input === 'number') return input
  if (!input) return 0
  const normalized = input
    .toString()
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '')
  const result = Number(normalized)
  return Number.isNaN(result) ? 0 : result
}

export const normalizeCurrencyInput = (value) => formatDecimal(parseLocaleNumber(value))
