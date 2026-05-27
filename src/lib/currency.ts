export const DEFAULT_CURRENCY = 'INR';

export const RAZORPAY_SUPPORTED_CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'HKD',
  'NZD',
  'SAR',
  'SEK',
  'SGD',
] as const;

export type SupportedCurrency = (typeof RAZORPAY_SUPPORTED_CURRENCIES)[number];

const supportedCurrencies = new Set<string>(RAZORPAY_SUPPORTED_CURRENCIES);

const currencyLocales: Record<SupportedCurrency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AED: 'en-AE',
  AUD: 'en-AU',
  CAD: 'en-CA',
  CHF: 'de-CH',
  CNY: 'zh-CN',
  HKD: 'zh-HK',
  NZD: 'en-NZ',
  SAR: 'en-SA',
  SEK: 'sv-SE',
  SGD: 'en-SG',
};

export function normalizeCurrency(value: unknown): SupportedCurrency {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : DEFAULT_CURRENCY;
  return supportedCurrencies.has(normalized) ? (normalized as SupportedCurrency) : DEFAULT_CURRENCY;
}

export function formatMoney(amount: number | string | null | undefined, currency?: string): string {
  const normalizedCurrency = normalizeCurrency(currency);
  const locale = currencyLocales[normalizedCurrency];
  const numericAmount = typeof amount === 'number' ? amount : Number(amount || 0);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  return `${normalizedCurrency} ${safeAmount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function summarizeAmountsByCurrency(
  items: Array<{ amount: number | string | null | undefined; currency?: string }>
): string {
  const totals = new Map<string, number>();

  for (const item of items) {
    const normalizedCurrency = normalizeCurrency(item.currency);
    const numericAmount = typeof item.amount === 'number' ? item.amount : Number(item.amount || 0);
    const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

    totals.set(normalizedCurrency, (totals.get(normalizedCurrency) || 0) + safeAmount);
  }

  if (totals.size === 0) {
    return formatMoney(0, DEFAULT_CURRENCY);
  }

  return Array.from(totals.entries())
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(' | ');
}