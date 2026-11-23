import type { ApprovalStatus, BookingStatus, PaymentStatus, Role, Shift } from '@/lib/types';

export type Translator = (key: string, values?: Record<string, string | number>) => string;

// Stored values stay in English (the API and database use them); only the
// text shown to people is translated, so each stored value maps to a key.
export const CATEGORY_KEY: Record<string, string> = {
  Smartphone: 'smartphone',
  'Laptop & PC': 'laptop',
  AC: 'ac',
  Refrigerator: 'refrigerator',
  TV: 'tv',
  'Washing Machine': 'washingMachine',
  Electrical: 'electrical',
};

export const SERVICE_MODE_KEY: Record<string, string> = {
  'Home Visit': 'homeVisit',
  'Shop Drop-off': 'shopDropOff',
};

const SHIFT_VALUES: string[] = ['morning', 'noon', 'evening', 'night'];

export const AREA_KEY: Record<string, string> = {
  'Mirpur, Dhaka': 'mirpur',
  'Dhanmondi, Dhaka': 'dhanmondi',
};

// `t` must be scoped to the "labels" namespace.
export function labelMaker(t: Translator) {
  const mapped = (map: Record<string, string>, group: string, value: string) =>
    map[value] ? t(`${group}.${map[value]}`) : value;
  return {
    role: (role: Role) => t(`role.${role}`),
    // Bookings made before shifts existed have none; show nothing for them.
    shift: (shift: Shift | undefined) => (shift && SHIFT_VALUES.includes(shift) ? t(`shift.${shift}`) : shift ?? ''),
    shiftName: (shift: string) => (SHIFT_VALUES.includes(shift) ? t(`shiftName.${shift}`) : shift),
    status: (status: BookingStatus | 'paid') => t(`status.${status}`),
    payment: (status: PaymentStatus) => t(`payment.${status}`),
    approval: (status: ApprovalStatus) => t(`approval.${status}`),
    category: (category: string) => mapped(CATEGORY_KEY, 'category', category),
    serviceMode: (mode: string) => mapped(SERVICE_MODE_KEY, 'serviceMode', mode),
    area: (area: string) => mapped(AREA_KEY, 'area', area),
  };
}
