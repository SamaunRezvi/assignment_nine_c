import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_CLASS, PAYMENT_BADGE_CLASS } from '@/lib/helpers';
import { useLabels } from '@/i18n/use-format';
import type { BookingStatus, PaymentStatus } from '@/lib/types';

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const labels = useLabels();
  return (
    <Badge variant="outline" className={STATUS_BADGE_CLASS[status]}>
      {labels.status(status)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const labels = useLabels();
  return (
    <Badge variant="outline" className={PAYMENT_BADGE_CLASS[status]}>
      {labels.payment(status)}
    </Badge>
  );
}
