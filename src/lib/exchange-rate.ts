import { DEFAULT_CURRENCY, normalizeCurrency } from '@/lib/currency';

export async function getInrConversionRate(currency: string): Promise<number> {
  const normalizedCurrency = normalizeCurrency(currency);

  if (normalizedCurrency === DEFAULT_CURRENCY) {
    return 1;
  }

  const response = await fetch('https://open.er-api.com/v6/latest/INR', {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch live currency conversion rate');
  }

  const data = (await response.json()) as { rates?: Record<string, number> };
  const rate = data?.rates?.[normalizedCurrency];

  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Conversion rate for ${normalizedCurrency} is unavailable`);
  }

  return Number(rate.toFixed(6));
}