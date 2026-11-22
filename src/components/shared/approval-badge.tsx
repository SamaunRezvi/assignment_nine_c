import { Badge } from '@/components/ui/badge';
import type { ApprovalStatus } from '@/lib/types';

const CLASS_MAP: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const LABEL_MAP: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  return (
    <Badge variant="outline" className={CLASS_MAP[status]}>
      {LABEL_MAP[status]}
    </Badge>
  );
}
