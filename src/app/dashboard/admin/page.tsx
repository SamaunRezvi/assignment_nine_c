'use client';

import { useEffect, useState } from 'react';
import { Users, Wrench, Hourglass, ShieldCheck, ClipboardList, Receipt } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { QuickActions } from '@/components/shared/quick-actions';
import { RecentJobsList } from '@/components/shared/recent-jobs-list';
import { StatusBreakdownChart } from '@/components/shared/status-breakdown-chart';
import { NotificationPreview } from '@/components/shared/notification-preview';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { Booking } from '@/lib/types';

const QUICK_ACTIONS = [
  { label: 'Manage Users', description: 'Review accounts and change user roles.', href: '/dashboard/admin/users', icon: Users },
  { label: 'Service Approval', description: 'Approve or reject technician service listings.', href: '/dashboard/admin/services', icon: ShieldCheck },
  { label: 'All Bookings', description: 'Monitor every repair job on the platform.', href: '/dashboard/admin/bookings', icon: ClipboardList },
  { label: 'Transactions', description: 'See every payment and total revenue.', href: '/dashboard/admin/transactions', icon: Receipt },
];

interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  pendingServices: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api.get<AdminStats>('/api/admin/stats').then(setStats).catch(() => setStats(null));
    api.get<Booking[]>('/api/admin/bookings').then(setBookings).catch(() => setBookings([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Platform wide activity at a glance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Users" value={stats?.totalUsers ?? '-'} icon={Users} />
        <StatsCard label="Total Technicians" value={stats?.totalTechnicians ?? '-'} icon={Wrench} />
        <StatsCard label="Pending Services" value={stats?.pendingServices ?? '-'} icon={Hourglass} />
      </div>
      <QuickActions actions={QUICK_ACTIONS} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent Bookings</h2>
          <RecentJobsList bookings={bookings} nameField="customerName" emptyMessage="No bookings on the platform yet." />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Platform Status Breakdown</h2>
          <Card className="p-4">
            <StatusBreakdownChart bookings={bookings} />
          </Card>
        </div>
      </div>
      <NotificationPreview />
    </div>
  );
}
