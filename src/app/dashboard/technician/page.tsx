'use client';

import { useEffect, useState } from 'react';
import { Wrench, ShieldCheck, Inbox, PlusCircle, ListChecks, ClipboardList, UserCog } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { RatingOverviewCard } from '@/components/shared/rating-overview-card';
import { QuickActions } from '@/components/shared/quick-actions';
import { RecentJobsList } from '@/components/shared/recent-jobs-list';
import { StatusBreakdownChart } from '@/components/shared/status-breakdown-chart';
import { NotificationPreview } from '@/components/shared/notification-preview';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { Booking } from '@/lib/types';

const QUICK_ACTIONS = [
  { label: 'Add a Service', description: 'List a new repair service for customers to book.', href: '/dashboard/technician/add-service', icon: PlusCircle },
  { label: 'My Services', description: 'Edit, pause or delete your listed services.', href: '/dashboard/technician/my-services', icon: ListChecks },
  { label: 'Manage Requests', description: 'Accept, update and complete incoming jobs.', href: '/dashboard/technician/requests', icon: ClipboardList },
  { label: 'Update Profile', description: 'Keep your bio, area and photo current.', href: '/dashboard/profile', icon: UserCog },
];

interface TechnicianStats {
  totalServices: number;
  approvedServices: number;
  pendingRequests: number;
  averageRating: number | null;
  reviewCount: number;
}

export default function TechnicianOverviewPage() {
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api.get<TechnicianStats>('/api/users/stats').then(setStats).catch(() => setStats(null));
    api.get<Booking[]>('/api/bookings/technician').then(setBookings).catch(() => setBookings([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">A summary of your services and incoming jobs.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Services" value={stats?.totalServices ?? '-'} icon={Wrench} />
        <StatsCard label="Approved Services" value={stats?.approvedServices ?? '-'} icon={ShieldCheck} />
        <StatsCard label="Pending Requests" value={stats?.pendingRequests ?? '-'} icon={Inbox} />
        <RatingOverviewCard averageRating={stats?.averageRating ?? null} reviewCount={stats?.reviewCount ?? 0} />
      </div>
      <QuickActions actions={QUICK_ACTIONS} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-3 lg:col-span-2">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">Recent Jobs</h2>
          <RecentJobsList bookings={bookings} nameField="customerName" emptyMessage="No repair requests yet." />
        </div>
        <div className="min-w-0 space-y-3">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">Job Status Breakdown</h2>
          <Card className="min-w-0 p-4">
            <StatusBreakdownChart bookings={bookings} />
          </Card>
        </div>
      </div>
      <NotificationPreview />
    </div>
  );
}
