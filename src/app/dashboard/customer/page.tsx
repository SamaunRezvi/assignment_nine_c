'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Hourglass, CheckCircle2, Search, Receipt, UserCog } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { QuickActions } from '@/components/shared/quick-actions';
import { api } from '@/lib/api-client';

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

  useEffect(() => {
    api.get<CustomerStats>('/api/users/stats').then(setStats).catch(() => setStats(null));
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
    </div>
  );
}
