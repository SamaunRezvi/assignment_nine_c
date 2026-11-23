'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badges';
import { CompleteJobDialog } from '@/components/shared/complete-job-dialog';
import { BookingDetailDialog } from '@/components/shared/booking-detail-dialog';
import { AcceptBookingDialog } from '@/components/shared/accept-booking-dialog';
import { ProposeRescheduleDialog } from '@/components/shared/propose-reschedule-dialog';
import { ShiftLockPanel } from '@/components/shared/shift-lock-panel';
import { RatingStars } from '@/components/shared/rating-stars';
import { useLiveResource } from '@/lib/use-live-resource';
import { api } from '@/lib/api-client';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { Booking, BookingStatus } from '@/lib/types';

const STATUS_FILTERS = ['all', 'requested', 'accepted', 'reschedule-proposed', 'in-progress', 'completed'] as const;

export default function TechnicianRequestsPage() {
  const t = useTranslations('requests');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const format = useFormat();
  const [statusFilter, setStatusFilter] = useState('all');
  const [completeTarget, setCompleteTarget] = useState<Booking | null>(null);
  const [detailTarget, setDetailTarget] = useState<Booking | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<Booking | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);

  const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
  const { data, loading, error, refresh: loadBookings } = useLiveResource<Booking[]>(`/api/bookings/technician${query}`);
  const bookings = data ?? [];

  async function updateStatus(booking: Booking, status: BookingStatus) {
    try {
      await api.patch(`/api/bookings/${booking._id}/status`, { status });
      toast.success(t('statusUpdated'));
      loadBookings();
    } catch {
      toast.error(t('updateError'));
    }
  }

  function renderActions(booking: Booking) {
    switch (booking.status) {
      case 'requested':
        return (
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" onClick={() => setAcceptTarget(booking)}>
              {t('accept')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRescheduleTarget(booking)}>
              {t('reschedule')}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(booking, 'rejected')}>
              {tCommon('reject')}
            </Button>
          </div>
        );
      case 'reschedule-proposed':
        return <span className="text-sm text-muted-foreground">{t('awaitingCustomer')}</span>;
      case 'accepted':
        return (
          <Button size="sm" onClick={() => updateStatus(booking, 'in-progress')}>
            {t('startWork')}
          </Button>
        );
      case 'in-progress':
        return (
          <Button size="sm" onClick={() => setCompleteTarget(booking)}>
            {t('markCompleted')}
          </Button>
        );
      case 'completed':
        return <PaymentStatusBadge status={booking.paymentStatus} />;
      default:
        return null;
    }
  }

  if (loading) return <p className="text-muted-foreground">{t('loading')}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f === 'all' ? tCommon('all') : labels.status(f)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ShiftLockPanel />

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border p-4 text-sm">
        <p>{t('loadError')} {data ? t('showingLast') : t('pleaseRetry')}</p>
        <Button variant="outline" onClick={() => void loadBookings()}>{tCommon('retry')}</Button>
      </div>}

      {!error && bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">{t('empty')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCommon('columns.customer')}</TableHead>
                <TableHead>{tCommon('columns.phone')}</TableHead>
                <TableHead>{tCommon('columns.address')}</TableHead>
                <TableHead>{tCommon('columns.preferredDate')}</TableHead>
                <TableHead>{tCommon('columns.shift')}</TableHead>
                <TableHead>{tCommon('columns.problem')}</TableHead>
                <TableHead>{tCommon('columns.status')}</TableHead>
                <TableHead>{tCommon('columns.customerRating')}</TableHead>
                <TableHead className="text-right">{tCommon('columns.details')}</TableHead>
                <TableHead className="text-right">{tCommon('columns.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{booking.customerName}</TableCell>
                  <TableCell>{booking.customerPhone}</TableCell>
                  <TableCell className="max-w-40 truncate">{booking.address}</TableCell>
                  <TableCell>{format.date(booking.preferredDate)}</TableCell>
                  <TableCell className="whitespace-normal">
                    <div>{labels.shift(booking.shift)}</div>
                    {booking.assignedTimeSlot && <div className="text-xs text-muted-foreground">{t('slot', { slot: booking.assignedTimeSlot })}</div>}
                  </TableCell>
                  <TableCell className="max-w-56 truncate">{booking.problemDescription}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="min-w-40 whitespace-normal">
                    {booking.rating ? (
                      <div className="space-y-1">
                        <div role="img" aria-label={t('ratingAria', { rating: booking.rating })}>
                          <RatingStars rating={booking.rating} />
                        </div>
                        {booking.ratedAt && <p className="text-xs text-muted-foreground">{t('ratedOn', { date: format.date(booking.ratedAt) })}</p>}
                      </div>
                    ) : <span className="text-sm text-muted-foreground">{booking.status === 'completed' && booking.paymentStatus === 'paid' ? t('awaitingRating') : t('ratingLater')}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setDetailTarget(booking)}>
                      {tCommon('view')}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">{renderActions(booking)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {completeTarget && (
        <CompleteJobDialog
          booking={completeTarget}
          open={!!completeTarget}
          onOpenChange={(open) => !open && setCompleteTarget(null)}
          onCompleted={loadBookings}
        />
      )}

      <BookingDetailDialog booking={detailTarget} viewerRole="technician" onOpenChange={(open) => !open && setDetailTarget(null)} />

      {acceptTarget && (
        <AcceptBookingDialog
          booking={acceptTarget}
          open={!!acceptTarget}
          onOpenChange={(open) => !open && setAcceptTarget(null)}
          onAccepted={loadBookings}
        />
      )}

      {rescheduleTarget && (
        <ProposeRescheduleDialog
          booking={rescheduleTarget}
          open={!!rescheduleTarget}
          onOpenChange={(open) => !open && setRescheduleTarget(null)}
          onProposed={loadBookings}
        />
      )}
    </div>
  );
}
