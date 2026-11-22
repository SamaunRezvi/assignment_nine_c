'use client';

import Image from 'next/image';
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
import { formatCurrency, formatDate } from '@/lib/helpers';
import type { Booking, Role } from '@/lib/types';

interface BookingDetailDialogProps {
  booking: Booking | null;
  viewerRole: Role;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({ booking, viewerRole, onOpenChange }: BookingDetailDialogProps) {
  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        {booking && (
          <>
            <DialogHeader>
              <DialogTitle>{booking.serviceTitle}</DialogTitle>
              <DialogDescription>
                {viewerRole === 'technician' ? `Requested by ${booking.customerName}` : `Technician: ${booking.technicianName}`}
              </DialogDescription>
            </DialogHeader>

            <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
              <Image src={booking.serviceImage} alt={booking.serviceTitle} fill className="object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </div>
              <div>
                <p className="text-muted-foreground">Preferred Date</p>
                <p className="font-medium">{formatDate(booking.preferredDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">{formatCurrency(booking.finalAmount)}</p>
              </div>
            </div>

            {viewerRole !== 'technician' && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Customer Phone</p>
                <p className="font-medium">{booking.customerPhone}</p>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium">{booking.address}</p>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Problem Description</p>
              <p className="whitespace-pre-wrap break-words">{booking.problemDescription}</p>
            </div>

            {booking.rating && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Customer Rating</p>
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
                <p className="text-muted-foreground">Job Timeline</p>
                <BookingTimeline statusHistory={booking.statusHistory} />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
