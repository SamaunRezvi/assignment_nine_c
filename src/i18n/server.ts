import { getLocale, getTranslations } from 'next-intl/server';
import { formatCurrency } from '@/lib/helpers';
import { labelMaker, type Translator } from './labels';

// Server-component counterparts of useLabels/useFormat for async pages.
export async function getLabels() {
  return labelMaker((await getTranslations('labels')) as unknown as Translator);
}

export async function getFormat() {
  const locale = await getLocale();
  return { locale, currency: (amount: number) => formatCurrency(amount, locale) };
}
