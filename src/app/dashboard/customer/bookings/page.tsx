'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { CalendarX } from 'lucide-react';
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
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/helpers';
import type { Booking } from '@/lib/types';

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
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

  async function handlePayNow(booking: Booking) {
    setPayingId(booking._id);
    try {
      const { url } = await api.post<{ url: string }>('/api/payments/create-checkout-session', {
        bookingId: booking._id,
      });
      window.location.href = url;
    } catch {
      toast.error('Could not start the payment');
      setPayingId(null);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading your bookings...</p>;

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <CalendarX className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">You have not requested any repairs yet</p>
        <Button asChild>
          <a href="/services">Browse Services</a>
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
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
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
                  {booking.status === 'requested' && (
                    <Button variant="outline" size="sm" onClick={() => setCancelTarget(booking)}>
                      Cancel
                    </Button>
                  )}
                  {booking.status === 'completed' && booking.paymentStatus === 'unpaid' && (
                    <Button size="sm" disabled={payingId === booking._id} onClick={() => handlePayNow(booking)}>
                      {payingId === booking._id ? 'Redirecting...' : 'Pay Now'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
}
