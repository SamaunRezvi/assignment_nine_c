import {
  LayoutDashboard,
  CalendarCheck,
  Receipt,
  PlusCircle,
  Wrench,
  ClipboardList,
  Users,
  ShieldCheck,
  BadgeDollarSign,
  UserPen,
} from 'lucide-react';
import type { Role } from './types';

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const DASHBOARD_NAV: Record<Role, NavItem[]> = {
  customer: [
    { href: '/dashboard/customer', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/customer/bookings', label: 'My Bookings', icon: CalendarCheck },
    { href: '/dashboard/customer/payments', label: 'Payment History', icon: Receipt },
    { href: '/dashboard/profile', label: 'Update Profile', icon: UserPen },
  ],
  technician: [
    { href: '/dashboard/technician', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/technician/add-service', label: 'Add Service', icon: PlusCircle },
    { href: '/dashboard/technician/my-services', label: 'My Services', icon: Wrench },
    { href: '/dashboard/technician/requests', label: 'Manage Requests', icon: ClipboardList },
    { href: '/dashboard/profile', label: 'Update Profile', icon: UserPen },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
    { href: '/dashboard/admin/services', label: 'Service Approval', icon: ShieldCheck },
    { href: '/dashboard/admin/bookings', label: 'All Bookings', icon: CalendarCheck },
    { href: '/dashboard/admin/transactions', label: 'Transactions', icon: BadgeDollarSign },
    { href: '/dashboard/profile', label: 'Update Profile', icon: UserPen },
  ],
};
