'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function BecomeTechnicianButton() {
  const t = useTranslations('home');
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
    <Button
      size="lg"
      variant="outline"
      className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
      asChild
    >
      <Link href="/sign-up">{t('becomeTechnician')}</Link>
    </Button>
  );
}
