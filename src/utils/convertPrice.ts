/**
 * Format a price value according to currency.
 * @param value - numeric price
 * @param currency - currency code, e.g., "USD", "EUR", "PLN"
 * @param locale - optional locale, default is 'en-US'
 * @returns formatted price string
 */
export function formatPrice(value: number, currency: string, locale = 'en-US'): string {
  if (typeof value !== 'number' || isNaN(value)) return '';
  if (!currency) currency = 'USD';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}