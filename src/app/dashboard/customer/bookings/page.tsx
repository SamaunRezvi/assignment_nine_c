'use client';

import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { formatCurrency, formatDate, SHIFT_LABEL } from '@/lib/helpers';
import type { Booking } from '@/lib/types';

export default function CustomerBookingsPage() {
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
      toast.success('Booking cancelled');
      setCancelTarget(null);
      loadBookings();
    } catch {
      toast.error('Could not cancel this booking');
    }
  }

  async function handleRescheduleResponse(booking: Booking, accept: boolean) {
    setRespondingId(booking._id);
    try {
      await api.patch(`/api/bookings/${booking._id}/reschedule-response`, { accept });
      toast.success(accept ? 'New time accepted' : 'Reschedule rejected');
      setRejectRescheduleTarget(null);
      loadBookings();
    } catch {
      toast.error('Could not respond to this reschedule proposal');
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
      toast.error('Could not start the payment');
      setPayingId(null);
    }
  }

  async function handleDownloadInvoice(booking: Booking) {
    try {
      await downloadInvoice(booking._id);
    } catch {
      toast.error('Could not download the invoice');
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading your bookings...</p>;

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <CalendarX className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">You have not requested any repairs yet</p>
        <Button asChild>
          <Link href="/services">Browse Services</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">Track and manage your repair requests.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                    <TableCell>{formatDate(booking.preferredDate)}</TableCell>
                    <TableCell>{formatCurrency(booking.finalAmount)}</TableCell>
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
                            Cancel
                          </Button>
                        )}
                        {booking.status === 'reschedule-proposed' && (
                          <>
                            <Button
                              size="sm"
                              disabled={respondingId === booking._id}
                              onClick={() => handleRescheduleResponse(booking, true)}
                            >
                              Accept New Time
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setRejectRescheduleTarget(booking)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status === 'completed' && booking.paymentStatus === 'unpaid' && (
                          <Button size="sm" disabled={payingId === booking._id} onClick={() => handlePayNow(booking)}>
                            {payingId === booking._id ? 'Redirecting...' : 'Pay Now'}
                          </Button>
                        )}
                        {canRate && !booking.rating && (
                          <Button variant="outline" size="sm" onClick={() => setRateTarget(booking)}>
                            Rate this job
                          </Button>
                        )}
                        {canRate && booking.rating && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {booking.rating}
                          </span>
                        )}
                        {booking.paymentStatus === 'paid' && (
                          <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(booking)}>
                            <Download className="h-3.5 w-3.5" />
                            Invoice
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/bookings/${booking._id}`}>Open</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={expanded ? 'Hide booking details' : 'Show booking details'}
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
                          <p className="text-sm text-muted-foreground">No timeline available for this booking.</p>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">Shift: {SHIFT_LABEL[booking.shift]}</p>
                        {booking.assignedTimeSlot && (
                          <p className="text-sm text-muted-foreground">Confirmed time slot: {booking.assignedTimeSlot}</p>
                        )}
                        {booking.status === 'reschedule-proposed' && booking.proposedDate && booking.proposedShift && (
                          <div className="mt-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm">
                            <p className="font-medium text-orange-700">
                              Technician proposed {formatDate(booking.proposedDate)}, {SHIFT_LABEL[booking.proposedShift]}
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
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              This will cancel your request for {cancelTarget?.serviceTitle}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectRescheduleTarget} onOpenChange={(open) => !open && setRejectRescheduleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this new time?</DialogTitle>
            <DialogDescription>
              This will reject the technician&apos;s proposed time for {rejectRescheduleTarget?.serviceTitle}. The request will be marked as rejected and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectRescheduleTarget(null)}>
              Keep Reviewing
            </Button>
            <Button
              variant="destructive"
              disabled={respondingId === rejectRescheduleTarget?._id}
              onClick={() => rejectRescheduleTarget && handleRescheduleResponse(rejectRescheduleTarget, false)}
            >
              Reject
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
