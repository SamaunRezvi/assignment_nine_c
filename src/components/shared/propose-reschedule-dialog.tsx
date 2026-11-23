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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { SHIFTS, type Booking, type Shift } from '@/lib/types';

export function ProposeRescheduleDialog({
  booking,
  open,
  onOpenChange,
  onProposed,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProposed: () => void;
}) {
  const [proposedDate, setProposedDate] = useState('');
  const [proposedShift, setProposedShift] = useState<Shift | ''>('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!proposedDate || !proposedShift) {
      toast.error('Please select a proposed date and shift');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/propose-reschedule`, {
        proposedDate,
        proposedShift,
        message: message.trim(),
      });
      toast.success('Reschedule proposed to the customer');
      onOpenChange(false);
      onProposed();
    } catch {
      toast.error('Could not propose a reschedule for this request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Propose a different time to {booking.customerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proposedDate">Proposed Date</Label>
            <Input
              id="proposedDate"
              type="date"
              required
              min={today}
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proposedShift">Proposed Shift</Label>
            <Select required value={proposedShift} onValueChange={(value) => setProposedShift(value as Shift)}>
              <SelectTrigger id="proposedShift" className="w-full">
                <SelectValue placeholder="Select a shift" />
              </SelectTrigger>
              <SelectContent>
                {SHIFTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              rows={3}
              placeholder="Let the customer know why you're proposing a new time"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Sending...' : 'Send Proposal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
