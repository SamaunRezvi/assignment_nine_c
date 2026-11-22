import type { BookingStatus, PaymentStatus, Role } from './types';

export const STATUS_LABEL: Record<BookingStatus, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  'in-progress': 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  requested: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const PAYMENT_BADGE_CLASS: Record<PaymentStatus, string> = {
  unpaid: 'bg-slate-100 text-slate-600 border-slate-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const ROLE_LABEL: Record<Role, string> = {
  customer: 'Customer',
  technician: 'Technician',
  admin: 'Admin',
};

export function dashboardPathForRole(role: Role) {
  return `/dashboard/${role}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
