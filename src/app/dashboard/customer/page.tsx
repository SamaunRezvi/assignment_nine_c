'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Hourglass, CheckCircle2 } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { api } from '@/lib/api-client';

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
    </div>
  );
}
