'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  { key: 'users', href: '/dashboard/admin/users', icon: Users },
  { key: 'services', href: '/dashboard/admin/services', icon: ShieldCheck },
  { key: 'bookings', href: '/dashboard/admin/bookings', icon: ClipboardList },
  { key: 'transactions', href: '/dashboard/admin/transactions', icon: Receipt },
] as const;

interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  pendingServices: number;
}

export default function AdminOverviewPage() {
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api.get<AdminStats>('/api/admin/stats').then(setStats).catch(() => setStats(null));
    api.get<Booking[]>('/api/admin/bookings').then(setBookings).catch(() => setBookings([]));
  }, []);

  const actions = QUICK_ACTIONS.map((action) => ({
    ...action,
    label: t(`admin.actions.${action.key}.label`),
    description: t(`admin.actions.${action.key}.description`),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('overview')}</h1>
        <p className="text-muted-foreground">{t('admin.subtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={t('admin.totalUsers')} value={stats?.totalUsers ?? '-'} icon={Users} />
        <StatsCard label={t('admin.totalTechnicians')} value={stats?.totalTechnicians ?? '-'} icon={Wrench} />
        <StatsCard label={t('admin.pendingServices')} value={stats?.pendingServices ?? '-'} icon={Hourglass} />
      </div>
      <QuickActions actions={actions} />
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-4">
        <div className="min-w-0 space-y-3 lg:col-span-2">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">{t('recentBookings')}</h2>
          <RecentJobsList bookings={bookings} nameField="customerName" emptyMessage={t('admin.noBookings')} />
        </div>
        <div className="min-w-0 space-y-3">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">{t('admin.breakdownTitle')}</h2>
          <Card className="min-w-0 p-4">
            <StatusBreakdownChart bookings={bookings} />
          </Card>
        </div>
      </div>
      <NotificationPreview />
    </div>
  );
}
