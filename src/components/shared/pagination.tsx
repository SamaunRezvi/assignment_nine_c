'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const t = useTranslations('services');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(target));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <Button variant="outline" size="icon" aria-label={t('previousPage')} disabled={page <= 1} onClick={() => goTo(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {t('pageOf', { page, total: totalPages })}
      </span>
      <Button variant="outline" size="icon" aria-label={t('nextPage')} disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
