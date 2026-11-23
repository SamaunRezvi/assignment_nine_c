'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import type { Booking } from '@/lib/types';

export function AcceptBookingDialog({
  booking,
  open,
  onOpenChange,
  onAccepted,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccepted: () => void;
}) {
  const [assignedTimeSlot, setAssignedTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!assignedTimeSlot.trim()) {
      toast.error('Please enter a time slot for this request');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/status`, {
        status: 'accepted',
        assignedTimeSlot: assignedTimeSlot.trim(),
      });
      toast.success('Request accepted');
      onOpenChange(false);
      onAccepted();
    } catch {
      toast.error('Could not accept this request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept request and assign a time slot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assignedTimeSlot">Time Slot</Label>
            <Input
              id="assignedTimeSlot"
              required
              placeholder="e.g. 8:00 AM - 9:00 AM"
              value={assignedTimeSlot}
              onChange={(e) => setAssignedTimeSlot(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Pick any specific time within the customer&apos;s selected shift.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Accepting...' : 'Accept Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
