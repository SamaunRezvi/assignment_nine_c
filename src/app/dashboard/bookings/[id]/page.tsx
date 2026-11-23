'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badges';
import { BookingTimeline } from '@/components/shared/booking-timeline';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api-client';
import { downloadInvoice } from '@/lib/download-invoice';
import { dashboardPathForRole } from '@/lib/helpers';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { Booking } from '@/lib/types';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('bookingDetail');
  const tCommon = useTranslations('common');
  const tBookings = useTranslations('customerBookings');
  const labels = useLabels();
  const format = useFormat();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<Booking>(`/api/bookings/${id}`)
      .then(setBooking)
      .catch((error) => {
        if (error instanceof ApiError && error.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const backHref = user ? dashboardPathForRole(user.role) : '/dashboard/profile';

  if (loading) return <p className="text-muted-foreground">{t('loading')}</p>;

  if (notFound || !booking) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">{t('notFound')}</p>
        <Button variant="outline" asChild>
          <Link href={backHref}>{tCommon('backToDashboard')}</Link>
        </Button>
      </div>
    );
  }

  const viewerRole = user?.role ?? 'customer';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={backHref}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          {tCommon('back')}
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{booking.serviceTitle}</h1>
          <p className="text-muted-foreground">
            {viewerRole === 'technician' ? t('requestedBy', { name: booking.customerName }) : t('technicianLine', { name: booking.technicianName })}
          </p>
        </div>
        {viewerRole === 'customer' && booking.paymentStatus === 'paid' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadInvoice(booking._id).catch(() => toast.error(tBookings('invoiceError')))}
          >
            <Download className="h-3.5 w-3.5" />
            {tCommon('invoice')}
          </Button>
        )}
      </div>

      <Card className="space-y-6 p-6">
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
          <Image src={booking.serviceImage} alt={booking.serviceTitle} fill className="object-cover" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
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
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
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
      </Card>
    </div>
  );
}
