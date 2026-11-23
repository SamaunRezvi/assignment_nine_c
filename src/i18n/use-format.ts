import { useLocale, useTranslations } from 'next-intl';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/helpers';
import { labelMaker, type Translator } from './labels';

// Works in client components and non-async server components.
export function useFormat() {
  const locale = useLocale();
  return {
    locale,
    currency: (amount: number) => formatCurrency(amount, locale),
    number: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, locale, options),
    date: (value: string | Date) => formatDate(value, locale),
    dateTime: (value: string | Date) => formatDateTime(value, locale),
  };
}

export function useLabels() {
  return labelMaker(useTranslations('labels') as unknown as Translator);
}
