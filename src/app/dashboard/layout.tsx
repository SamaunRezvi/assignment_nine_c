'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';
import { DashboardTopbar } from '@/components/shared/dashboard-topbar';
import { dashboardPathForRole } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/sign-in?redirect=${pathname}`);
      return;
    }

    if (pathname !== '/dashboard/profile' && !pathname.startsWith(dashboardPathForRole(user.role))) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <DashboardSidebar role={user.role} />
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar user={user} />
        <main className="flex-1 bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
