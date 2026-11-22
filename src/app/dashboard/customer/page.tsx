'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Hourglass, CheckCircle2, Search, Receipt, UserCog } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { QuickActions } from '@/components/shared/quick-actions';
import { RecentJobsList } from '@/components/shared/recent-jobs-list';
import { StatusBreakdownChart } from '@/components/shared/status-breakdown-chart';
import { NotificationPreview } from '@/components/shared/notification-preview';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { Booking } from '@/lib/types';

const QUICK_ACTIONS = [
  { label: 'Browse Services', description: 'Find a verified technician for your next repair.', href: '/services', icon: Search },
  { label: 'My Bookings', description: 'Track, pay for or cancel your repair requests.', href: '/dashboard/customer/bookings', icon: ClipboardList },
  { label: 'Payment History', description: 'Review receipts for jobs you have paid for.', href: '/dashboard/customer/payments', icon: Receipt },
  { label: 'Update Profile', description: 'Keep your contact details current.', href: '/dashboard/profile', icon: UserCog },
];

interface CustomerStats {
  totalRequests: number;
  activeJobs: number;
  completedJobs: number;
}

export default function CustomerOverviewPage() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api.get<CustomerStats>('/api/users/stats').then(setStats).catch(() => setStats(null));
    api.get<Booking[]>('/api/bookings/my').then(setBookings).catch(() => setBookings([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">A quick look at your repair activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Requests" value={stats?.totalRequests ?? '-'} icon={ClipboardList} />
        <StatsCard label="Active Jobs" value={stats?.activeJobs ?? '-'} icon={Hourglass} />
        <StatsCard label="Completed Jobs" value={stats?.completedJobs ?? '-'} icon={CheckCircle2} />
      </div>
      <QuickActions actions={QUICK_ACTIONS} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent Bookings</h2>
          <RecentJobsList bookings={bookings} nameField="technicianName" emptyMessage="You have not booked a repair yet." />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Booking Status Breakdown</h2>
          <Card className="p-4">
            <StatusBreakdownChart bookings={bookings} />
          </Card>
        </div>
      </div>
      <NotificationPreview />
    </div>
  );
}
