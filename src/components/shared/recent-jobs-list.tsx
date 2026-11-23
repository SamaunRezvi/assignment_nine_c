import { Card } from '@/components/ui/card';
import { BookingStatusBadge } from '@/components/shared/status-badges';
import { formatDate } from '@/lib/helpers';
import type { Booking } from '@/lib/types';

interface RecentJobsListProps {
  bookings: Booking[];
  nameField: 'customerName' | 'technicianName';
  emptyMessage: string;
}

export function RecentJobsList({ bookings, nameField, emptyMessage }: RecentJobsListProps) {
  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card className="flex min-h-56 items-center justify-center p-6 text-sm text-muted-foreground">
        {emptyMessage}
      </Card>
    );
  }

  return (
    <Card className="divide-y p-0">
      {recent.map((booking) => (
        <div key={booking._id} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-medium">{booking.serviceTitle}</p>
            <p className="truncate text-sm text-muted-foreground">
              {booking[nameField]} · {formatDate(booking.createdAt)}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      ))}
    </Card>
  );
}
