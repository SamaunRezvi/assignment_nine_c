import { Badge } from '@/components/ui/badge';
import { STATUS_LABEL, STATUS_BADGE_CLASS, PAYMENT_BADGE_CLASS } from '@/lib/helpers';
import type { BookingStatus, PaymentStatus } from '@/lib/types';

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE_CLASS[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={PAYMENT_BADGE_CLASS[status]}>
      {status === 'paid' ? 'Paid' : 'Unpaid'}
    </Badge>
  );
}
