'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/helpers';
import type { Booking, BookingStatus } from '@/lib/types';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function TechnicianRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [completeTarget, setCompleteTarget] = useState<Booking | null>(null);

  async function loadBookings() {
    setLoading(true);
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await api.get<Booking[]>(`/api/bookings/technician${query}`);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function updateStatus(booking: Booking, status: BookingStatus) {
    try {
      await api.patch(`/api/bookings/${booking._id}/status`, { status });
      toast.success('Booking status updated');
      loadBookings();
    } catch {
      toast.error('Could not update this booking');
    }
  }

  function renderActions(booking: Booking) {
    switch (booking.status) {
      case 'requested':
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => updateStatus(booking, 'accepted')}>
              Accept
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(booking, 'rejected')}>
              Reject
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button size="sm" onClick={() => updateStatus(booking, 'in-progress')}>
            Start Work
          </Button>
        );
      case 'in-progress':
        return (
          <Button size="sm" onClick={() => setCompleteTarget(booking)}>
            Mark Completed
          </Button>
        );
      case 'completed':
        return <PaymentStatusBadge status={booking.paymentStatus} />;
      default:
        return null;
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading requests...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Requests</h1>
          <p className="text-muted-foreground">Repair requests sent to your services.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
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

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No requests in this filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Preferred Date</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{booking.customerName}</TableCell>
                  <TableCell>{booking.customerPhone}</TableCell>
                  <TableCell className="max-w-40 truncate">{booking.address}</TableCell>
                  <TableCell>{formatDate(booking.preferredDate)}</TableCell>
                  <TableCell className="max-w-56 truncate">{booking.problemDescription}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
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
    </div>
  );
}
