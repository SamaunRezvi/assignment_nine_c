'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badges';
import { BookingTimeline } from '@/components/shared/booking-timeline';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { Booking, Role } from '@/lib/types';

interface BookingDetailDialogProps {
  booking: Booking | null;
  viewerRole: Role;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({ booking, viewerRole, onOpenChange }: BookingDetailDialogProps) {
  const t = useTranslations('bookingDetail');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const format = useFormat();
  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        {booking && (
          <>
            <DialogHeader>
              <DialogTitle>{booking.serviceTitle}</DialogTitle>
              <DialogDescription>
                {viewerRole === 'technician' ? t('requestedBy', { name: booking.customerName }) : t('technicianLine', { name: booking.technicianName })}
              </DialogDescription>
            </DialogHeader>

            <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
              <Image src={booking.serviceImage} alt={booking.serviceTitle} fill className="object-cover" />
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">{tCommon('columns.status')}</p>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div>
                <p className="text-muted-foreground">{tCommon('columns.payment')}</p>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </div>
              <div>
                <p className="text-muted-foreground">{tCommon('columns.preferredDate')}</p>
                <p className="font-medium">{format.date(booking.preferredDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{tCommon('columns.amount')}</p>
                <p className="font-medium">{format.currency(booking.finalAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{tCommon('columns.shift')}</p>
                <p className="font-medium">{labels.shift(booking.shift)}</p>
              </div>
              {booking.assignedTimeSlot && (
                <div>
                  <p className="text-muted-foreground">{t('timeSlot')}</p>
                  <p className="font-medium">{booking.assignedTimeSlot}</p>
                </div>
              )}
            </div>

            {booking.status === 'reschedule-proposed' && booking.proposedDate && booking.proposedShift && (
              <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm">
                <p className="font-medium text-orange-700">
                  {t('proposed', { date: format.date(booking.proposedDate), shift: labels.shift(booking.proposedShift) })}
                </p>
                {booking.rescheduleMessage && <p className="mt-1 text-muted-foreground">&quot;{booking.rescheduleMessage}&quot;</p>}
              </div>
            )}

            {viewerRole !== 'technician' && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{t('customerPhone')}</p>
                <p className="font-medium">{booking.customerPhone}</p>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">{tCommon('columns.address')}</p>
              <p className="font-medium">{booking.address}</p>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">{t('problemDescription')}</p>
              <p className="whitespace-pre-wrap break-words">{booking.problemDescription}</p>
            </div>

            {booking.completionPhoto && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{t('completionPhoto')}</p>
                <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
                  <Image src={booking.completionPhoto} alt={t('completedAlt')} fill className="object-cover" />
                </div>
              </div>
            )}

            {booking.rating && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{t('customerRating')}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= booking.rating! ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                {viewerRole !== 'technician' && booking.review && (
                  <p className="italic text-muted-foreground">&quot;{booking.review}&quot;</p>
                )}
              </div>
            )}

            {booking.statusHistory && booking.statusHistory.length > 0 && (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">{t('timeline')}</p>
                <BookingTimeline statusHistory={booking.statusHistory} />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
