'use client';

import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarX, ChevronDown, ChevronUp, Star, Download } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badges';
import { BookingTimeline } from '@/components/shared/booking-timeline';
import { RateJobDialog } from '@/components/shared/rate-job-dialog';
import { api } from '@/lib/api-client';
import { downloadInvoice } from '@/lib/download-invoice';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { Booking } from '@/lib/types';

export default function CustomerBookingsPage() {
  const t = useTranslations('customerBookings');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const format = useFormat();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [rateTarget, setRateTarget] = useState<Booking | null>(null);
  const [rejectRescheduleTarget, setRejectRescheduleTarget] = useState<Booking | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadBookings() {
    try {
      const data = await api.get<Booking[]>('/api/bookings/my');
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel() {
    if (!cancelTarget) return;
    try {
      await api.patch(`/api/bookings/${cancelTarget._id}/cancel`);
      toast.success(t('cancelled'));
      setCancelTarget(null);
      loadBookings();
    } catch {
      toast.error(t('cancelError'));
    }
  }

  async function handleRescheduleResponse(booking: Booking, accept: boolean) {
    setRespondingId(booking._id);
    try {
      await api.patch(`/api/bookings/${booking._id}/reschedule-response`, { accept });
      toast.success(accept ? t('newTimeAccepted') : t('rescheduleRejected'));
      setRejectRescheduleTarget(null);
      loadBookings();
    } catch {
      toast.error(t('respondError'));
    } finally {
      setRespondingId(null);
    }
  }

  async function handlePayNow(booking: Booking) {
    setPayingId(booking._id);
    try {
      const { url } = await api.post<{ url: string }>('/api/payments/create-checkout-session', {
        bookingId: booking._id,
      });
      window.location.assign(url);
    } catch {
      toast.error(t('payError'));
      setPayingId(null);
    }
  }

  async function handleDownloadInvoice(booking: Booking) {
    try {
      await downloadInvoice(booking._id);
    } catch {
      toast.error(t('invoiceError'));
    }
  }

  if (loading) return <p className="text-muted-foreground">{t('loading')}</p>;

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <CalendarX className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">{t('empty')}</p>
        <Button asChild>
          <Link href="/services">{tCommon('browseServices')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('columns.service')}</TableHead>
              <TableHead>{tCommon('columns.technician')}</TableHead>
              <TableHead>{tCommon('columns.preferredDate')}</TableHead>
              <TableHead>{tCommon('columns.amount')}</TableHead>
              <TableHead>{tCommon('columns.status')}</TableHead>
              <TableHead>{tCommon('columns.payment')}</TableHead>
              <TableHead className="text-right">{tCommon('columns.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const expanded = expandedId === booking._id;
              const canRate = booking.status === 'completed' && booking.paymentStatus === 'paid';

              return (
                <Fragment key={booking._id}>
                  <TableRow>
                    <TableCell className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={booking.serviceImage} alt={booking.serviceTitle} fill className="object-cover" />
                      </div>
                      <span className="font-medium">{booking.serviceTitle}</span>
                    </TableCell>
                    <TableCell>{booking.technicianName}</TableCell>
                    <TableCell>{format.date(booking.preferredDate)}</TableCell>
                    <TableCell>{format.currency(booking.finalAmount)}</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'requested' && (
                          <Button variant="outline" size="sm" onClick={() => setCancelTarget(booking)}>
                            {tCommon('cancel')}
                          </Button>
                        )}
                        {booking.status === 'reschedule-proposed' && (
                          <>
                            <Button
                              size="sm"
                              disabled={respondingId === booking._id}
                              onClick={() => handleRescheduleResponse(booking, true)}
                            >
                              {t('acceptNewTime')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setRejectRescheduleTarget(booking)}>
                              {tCommon('reject')}
                            </Button>
                          </>
                        )}
                        {booking.status === 'completed' && booking.paymentStatus === 'unpaid' && (
                          <Button size="sm" disabled={payingId === booking._id} onClick={() => handlePayNow(booking)}>
                            {payingId === booking._id ? t('redirecting') : t('payNow')}
                          </Button>
                        )}
                        {canRate && !booking.rating && (
                          <Button variant="outline" size="sm" onClick={() => setRateTarget(booking)}>
                            {t('rate')}
                          </Button>
                        )}
                        {canRate && booking.rating && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {format.number(booking.rating)}
                          </span>
                        )}
                        {booking.paymentStatus === 'paid' && (
                          <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(booking)}>
                            <Download className="h-3.5 w-3.5" />
                            {tCommon('invoice')}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/bookings/${booking._id}`}>{tCommon('open')}</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={expanded ? t('hideDetails') : t('showDetails')}
                          onClick={() => setExpandedId(expanded ? null : booking._id)}
                        >
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30">
                        {booking.statusHistory && booking.statusHistory.length > 0 ? (
                          <BookingTimeline statusHistory={booking.statusHistory} />
                        ) : (
                          <p className="text-sm text-muted-foreground">{t('noTimeline')}</p>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">{t('shiftLine', { shift: labels.shift(booking.shift) })}</p>
                        {booking.assignedTimeSlot && (
                          <p className="text-sm text-muted-foreground">{t('slotLine', { slot: booking.assignedTimeSlot })}</p>
                        )}
                        {booking.status === 'reschedule-proposed' && booking.proposedDate && booking.proposedShift && (
                          <div className="mt-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm">
                            <p className="font-medium text-orange-700">
                              {t('proposed', { date: format.date(booking.proposedDate), shift: labels.shift(booking.proposedShift) })}
                            </p>
                            {booking.rescheduleMessage && <p className="mt-1 text-muted-foreground">&quot;{booking.rescheduleMessage}&quot;</p>}
                          </div>
                        )}
                        {booking.review && (
                          <p className="mt-3 text-sm italic text-muted-foreground">&quot;{booking.review}&quot;</p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelTitle')}</DialogTitle>
            <DialogDescription>
              {t('cancelText', { service: cancelTarget?.serviceTitle ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              {t('keepBooking')}
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              {t('confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectRescheduleTarget} onOpenChange={(open) => !open && setRejectRescheduleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectTitle')}</DialogTitle>
            <DialogDescription>
              {t('rejectText', { service: rejectRescheduleTarget?.serviceTitle ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectRescheduleTarget(null)}>
              {t('keepReviewing')}
            </Button>
            <Button
              variant="destructive"
              disabled={respondingId === rejectRescheduleTarget?._id}
              onClick={() => rejectRescheduleTarget && handleRescheduleResponse(rejectRescheduleTarget, false)}
            >
              {tCommon('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {rateTarget && (
        <RateJobDialog
          booking={rateTarget}
          open={!!rateTarget}
          onOpenChange={(open) => !open && setRateTarget(null)}
          onRated={loadBookings}
        />
      )}
    </div>
  );
}
