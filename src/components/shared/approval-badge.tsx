import { Badge } from '@/components/ui/badge';
import { useLabels } from '@/i18n/use-format';
import type { ApprovalStatus } from '@/lib/types';

const CLASS_MAP: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const labels = useLabels();
  return (
    <Badge variant="outline" className={CLASS_MAP[status]}>
      {labels.approval(status)}
    </Badge>
  );
}
