import {
  LayoutDashboard,
  CalendarCheck,
  CalendarX,
  Receipt,
  PlusCircle,
  Wrench,
  ClipboardList,
  Users,
  ShieldCheck,
  BadgeDollarSign,
  UserPen,
  BarChart3,
  Search,
} from 'lucide-react';
import type { Role } from './types';

export interface NavItem {
  href: string;
  // Key under nav.items in the message catalog.
  label: string;
  icon: typeof LayoutDashboard;
}

export const DASHBOARD_NAV: Record<Role, NavItem[]> = {
  customer: [
    { href: '/dashboard/customer', label: 'overview', icon: LayoutDashboard },
    { href: '/services', label: 'browseServices', icon: Search },
    { href: '/dashboard/customer/bookings', label: 'myBookings', icon: CalendarCheck },
    { href: '/dashboard/customer/payments', label: 'paymentHistory', icon: Receipt },
    { href: '/dashboard/profile', label: 'updateProfile', icon: UserPen },
  ],
  technician: [
    { href: '/dashboard/technician', label: 'overview', icon: LayoutDashboard },
    { href: '/dashboard/technician/add-service', label: 'addService', icon: PlusCircle },
    { href: '/dashboard/technician/my-services', label: 'myServices', icon: Wrench },
    { href: '/dashboard/technician/requests', label: 'manageRequests', icon: ClipboardList },
    { href: '/dashboard/technician/availability', label: 'availability', icon: CalendarX },
    { href: '/dashboard/profile', label: 'updateProfile', icon: UserPen },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'overview', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'manageUsers', icon: Users },
    { href: '/dashboard/admin/services', label: 'serviceApproval', icon: ShieldCheck },
    { href: '/dashboard/admin/bookings', label: 'allBookings', icon: CalendarCheck },
    { href: '/dashboard/admin/transactions', label: 'transactions', icon: BadgeDollarSign },
    { href: '/dashboard/admin/analytics', label: 'analytics', icon: BarChart3 },
    { href: '/dashboard/profile', label: 'updateProfile', icon: UserPen },
  ],
};
