import { INTL_LOCALE, isLocale } from '@/i18n/config';
import type { BookingStatus, PaymentStatus, Role } from './types';

export const STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  requested: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  'reschedule-proposed': 'bg-orange-100 text-orange-700 border-orange-200',
};

export const PAYMENT_BADGE_CLASS: Record<PaymentStatus, string> = {
  unpaid: 'bg-slate-100 text-slate-600 border-slate-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function dashboardPathForRole(role: Role) {
  return `/dashboard/${role}`;
}

function intlLocale(locale: string) {
  return isLocale(locale) ? INTL_LOCALE[locale] : INTL_LOCALE.en;
}

export function formatCurrency(amount: number, locale = 'en') {
  return new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatNumber(value: number, locale = 'en', options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatDate(value: string | Date, locale = 'en') {
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium' }).format(new Date(value));
}

export function formatDateTime(value: string | Date, locale = 'en') {
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
