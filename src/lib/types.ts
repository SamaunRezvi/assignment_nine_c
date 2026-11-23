export type Role = 'customer' | 'technician' | 'admin';

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'reschedule-proposed';

export type PaymentStatus = 'unpaid' | 'paid';

export type Shift = 'morning' | 'noon' | 'evening' | 'night';

export const SHIFTS: Shift[] = ['morning', 'noon', 'evening', 'night'];

export type ServiceMode = 'Home Visit' | 'Shop Drop-off';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export const CATEGORIES = [
  'Smartphone',
  'Laptop & PC',
  'AC',
  'Refrigerator',
  'TV',
  'Washing Machine',
  'Electrical',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  phone?: string;
  area?: string;
  bio?: string;
  unavailableDates?: string[];
  lockedShifts?: { date: string; shift: Shift }[];
}

export interface Service {
  _id: string;
  title: string;
  category: Category;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  isVerified?: boolean;
}

export interface StatusHistoryEntry {
  status: string;
  changedAt: string;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: Category;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  shift: Shift;
  assignedTimeSlot?: string;
  proposedDate?: string;
  proposedShift?: Shift;
  rescheduleMessage?: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount: number;
  completionPhoto?: string;
  paymentStatus: PaymentStatus;
  statusHistory?: StatusHistoryEntry[];
  rating?: number;
  review?: string;
  ratedAt?: string;
  createdAt: string;
}

export interface TechnicianProfile {
  name: string;
  email: string;
  image: string | null;
  area: string;
  bio: string;
  isVerified: boolean;
  services: Service[];
}

export interface Payment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: 'paid';
  paidAt: string;
}
