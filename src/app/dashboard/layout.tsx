'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';
import { DashboardTopbar } from '@/components/shared/dashboard-topbar';
import { dashboardPathForRole } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || error) return;

    if (!user) {
      router.replace(`/sign-in?redirect=${pathname}`);
      return;
    }

    const sharedRoute = pathname === '/dashboard/profile' || pathname.startsWith('/dashboard/bookings/');
    if (!sharedRoute && !pathname.startsWith(dashboardPathForRole(user.role))) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [loading, error, user, pathname, router]);

  if (error) return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p>{error}</p>
      <Button onClick={() => void refreshUser().catch(() => {})}>Retry loading account</Button>
    </div>
  );

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh min-w-0 self-start overflow-y-auto lg:block">
        <DashboardSidebar role={user.role} />
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-col">
        <DashboardTopbar user={user} />
        <main className="min-w-0 flex-1 bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
