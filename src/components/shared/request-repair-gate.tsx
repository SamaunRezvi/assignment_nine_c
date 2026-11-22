'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { RequestRepairDialog } from './request-repair-dialog';
import type { Service } from '@/lib/types';

export function RequestRepairGate({ service }: { service: Service }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => router.push(`/sign-in?redirect=/services/${service._id}`)}
      >
        Sign In to Request Repair
      </Button>
    );
  }

  if (user.role === 'technician' || user.role === 'admin') {
    return (
      <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        Only customers can request a repair.
      </p>
    );
  }

  return <RequestRepairDialog service={service} />;
}
