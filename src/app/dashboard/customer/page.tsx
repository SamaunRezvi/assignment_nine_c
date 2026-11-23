'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  { key: 'browse', href: '/services', icon: Search },
  { key: 'bookings', href: '/dashboard/customer/bookings', icon: ClipboardList },
  { key: 'payments', href: '/dashboard/customer/payments', icon: Receipt },
  { key: 'profile', href: '/dashboard/profile', icon: UserCog },
] as const;

interface CustomerStats {
  totalRequests: number;
  activeJobs: number;
  completedJobs: number;
}

export default function CustomerOverviewPage() {
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api.get<CustomerStats>('/api/users/stats').then(setStats).catch(() => setStats(null));
    api.get<Booking[]>('/api/bookings/my').then(setBookings).catch(() => setBookings([]));
  }, []);

  const actions = QUICK_ACTIONS.map((action) => ({
    ...action,
    label: t(`customer.actions.${action.key}.label`),
    description: t(`customer.actions.${action.key}.description`),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('overview')}</h1>
        <p className="text-muted-foreground">{t('customer.subtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={t('customer.totalRequests')} value={stats?.totalRequests ?? '-'} icon={ClipboardList} />
        <StatsCard label={t('customer.activeJobs')} value={stats?.activeJobs ?? '-'} icon={Hourglass} />
        <StatsCard label={t('customer.completedJobs')} value={stats?.completedJobs ?? '-'} icon={CheckCircle2} />
      </div>
      <QuickActions actions={actions} />
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-4">
        <div className="min-w-0 space-y-3 lg:col-span-2">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">{t('recentBookings')}</h2>
          <RecentJobsList bookings={bookings} nameField="technicianName" emptyMessage={t('customer.noBookings')} />
        </div>
        <div className="min-w-0 space-y-3">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">{t('customer.breakdownTitle')}</h2>
          <Card className="min-w-0 p-4">
            <StatusBreakdownChart bookings={bookings} />
          </Card>
        </div>
      </div>
      <NotificationPreview />
    </div>
  );
}
