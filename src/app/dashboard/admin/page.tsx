'use client';

import { useEffect, useState } from 'react';
import { Users, Wrench, Hourglass } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { api } from '@/lib/api-client';

interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  pendingServices: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get<AdminStats>('/api/admin/stats').then(setStats).catch(() => setStats(null));
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
    </div>
  );
}
