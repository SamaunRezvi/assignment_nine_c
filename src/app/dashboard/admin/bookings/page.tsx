'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badges';
import { BookingDetailDialog } from '@/components/shared/booking-detail-dialog';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/helpers';
import type { Booking } from '@/lib/types';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailTarget, setDetailTarget] = useState<Booking | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (search.trim()) params.set('search', search.trim());
    const query = params.toString() ? `?${params.toString()}` : '';

    const timer = setTimeout(() => {
      api
        .get<Booking[]>(`/api/admin/bookings${query}`)
        .then(setBookings)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Bookings</h1>
          <p className="text-muted-foreground">Every repair request across the platform.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search customer, technician or service"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          No bookings match this search or filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{booking.serviceTitle}</TableCell>
                  <TableCell>{booking.customerName}</TableCell>
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
                    <Button variant="outline" size="sm" onClick={() => setDetailTarget(booking)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BookingDetailDialog booking={detailTarget} viewerRole="admin" onOpenChange={(open) => !open && setDetailTarget(null)} />
    </div>
  );
}
