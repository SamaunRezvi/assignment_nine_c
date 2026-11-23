export const LOCALES = ['en', 'bn'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

// Intl tag used for numbers and dates, so Bangla mode shows Bangla digits.
export const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', bn: 'bn-BD' };
