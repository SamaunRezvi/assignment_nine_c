'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  { key: 'addService', href: '/dashboard/technician/add-service', icon: PlusCircle },
  { key: 'myServices', href: '/dashboard/technician/my-services', icon: ListChecks },
  { key: 'requests', href: '/dashboard/technician/requests', icon: ClipboardList },
  { key: 'profile', href: '/dashboard/profile', icon: UserCog },
] as const;

interface TechnicianStats {
  totalServices: number;
  approvedServices: number;
  pendingRequests: number;
  averageRating: number | null;
  reviewCount: number;
}

export default function TechnicianOverviewPage() {
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api.get<TechnicianStats>('/api/users/stats').then(setStats).catch(() => setStats(null));
    api.get<Booking[]>('/api/bookings/technician').then(setBookings).catch(() => setBookings([]));
  }, []);

  const actions = QUICK_ACTIONS.map((action) => ({
    ...action,
    label: t(`technician.actions.${action.key}.label`),
    description: t(`technician.actions.${action.key}.description`),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('overview')}</h1>
        <p className="text-muted-foreground">{t('technician.subtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label={t('technician.totalServices')} value={stats?.totalServices ?? '-'} icon={Wrench} />
        <StatsCard label={t('technician.approvedServices')} value={stats?.approvedServices ?? '-'} icon={ShieldCheck} />
        <StatsCard label={t('technician.pendingRequests')} value={stats?.pendingRequests ?? '-'} icon={Inbox} />
        <RatingOverviewCard averageRating={stats?.averageRating ?? null} reviewCount={stats?.reviewCount ?? 0} />
      </div>
      <QuickActions actions={actions} />
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-4">
        <div className="min-w-0 space-y-3 lg:col-span-2">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">{t('technician.recentJobs')}</h2>
          <RecentJobsList bookings={bookings} nameField="customerName" emptyMessage={t('technician.noJobs')} />
        </div>
        <div className="min-w-0 space-y-3">
          <h2 className="truncate px-1 text-sm font-semibold text-muted-foreground">{t('technician.breakdownTitle')}</h2>
          <Card className="min-w-0 p-4">
            <StatusBreakdownChart bookings={bookings} />
          </Card>
        </div>
      </div>
      <NotificationPreview />
    </div>
  );
}
