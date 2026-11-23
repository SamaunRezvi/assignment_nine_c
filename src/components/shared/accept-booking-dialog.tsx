'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('acceptDialog');
  const [assignedTimeSlot, setAssignedTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!assignedTimeSlot.trim()) {
      toast.error(t('needSlot'));
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/status`, {
        status: 'accepted',
        assignedTimeSlot: assignedTimeSlot.trim(),
      });
      toast.success(t('success'));
      onOpenChange(false);
      onAccepted();
    } catch {
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assignedTimeSlot">{t('timeSlot')}</Label>
            <Input
              id="assignedTimeSlot"
              required
              placeholder={t('placeholder')}
              value={assignedTimeSlot}
              onChange={(e) => setAssignedTimeSlot(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('hint')}
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
