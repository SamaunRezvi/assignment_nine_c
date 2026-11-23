'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function BecomeTechnicianButton() {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
    <Button
      size="lg"
      variant="outline"
      className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
      asChild
    >
      <Link href="/sign-up">Become a Technician</Link>
    </Button>
  );
}
