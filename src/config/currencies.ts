export type CurrencyCode = 'ETB' | 'USD'

export interface Currency {
  code: CurrencyCode
  symbol: string
  name: string
  rate: number // relative to ETB
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  ETB: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', rate: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0175 },
}

export const DEFAULT_CURRENCY: CurrencyCode = 'ETB'

export function convertPrice(amountEtb: number, toCurrency: CurrencyCode): number {
  return amountEtb * CURRENCIES[toCurrency].rate
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const c = CURRENCIES[currency]
  if (currency === 'ETB') return `${c.symbol} ${amount.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${c.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
