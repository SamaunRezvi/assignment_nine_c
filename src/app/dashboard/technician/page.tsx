'use client';

import { useEffect, useState } from 'react';
import { Wrench, ShieldCheck, Inbox, PlusCircle, ListChecks, ClipboardList, UserCog } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { QuickActions } from '@/components/shared/quick-actions';
import { api } from '@/lib/api-client';

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
}

export default function TechnicianOverviewPage() {
  const [stats, setStats] = useState<TechnicianStats | null>(null);

  useEffect(() => {
    api.get<TechnicianStats>('/api/users/stats').then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">A summary of your services and incoming jobs.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Services" value={stats?.totalServices ?? '-'} icon={Wrench} />
        <StatsCard label="Approved Services" value={stats?.approvedServices ?? '-'} icon={ShieldCheck} />
        <StatsCard label="Pending Requests" value={stats?.pendingRequests ?? '-'} icon={Inbox} />
      </div>
      <QuickActions actions={QUICK_ACTIONS} />
    </div>
  );
}
