'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { RequestRepairDialog } from './request-repair-dialog';
import type { Service } from '@/lib/types';

export function RequestRepairGate({ service }: { service: Service }) {
  const t = useTranslations('services');
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
        {t('signInToRequest')}
      </Button>
    );
  }

  if (user.role === 'technician' || user.role === 'admin') {
    return (
      <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        {t('onlyCustomers')}
      </p>
    );
  }

  return <RequestRepairDialog service={service} />;
}
