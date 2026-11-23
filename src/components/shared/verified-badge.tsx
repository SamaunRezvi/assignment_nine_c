import { useTranslations } from 'next-intl';
import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function VerifiedBadge() {
  const t = useTranslations('common');
  return (
    <Badge className="gap-1 border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      <BadgeCheck className="h-3.5 w-3.5" />
      {t('verified')}
    </Badge>
  );
}
