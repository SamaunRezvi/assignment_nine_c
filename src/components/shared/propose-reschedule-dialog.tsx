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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { SHIFTS, type Booking, type Shift } from '@/lib/types';
import { useLabels } from '@/i18n/use-format';

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
  const t = useTranslations('rescheduleDialog');
  const tCommon = useTranslations('common');
  const tShift = useTranslations('shiftLock');
  const labels = useLabels();
  const [proposedDate, setProposedDate] = useState('');
  const [proposedShift, setProposedShift] = useState<Shift | ''>('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!proposedDate || !proposedShift) {
      toast.error(t('needBoth'));
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/propose-reschedule`, {
        proposedDate,
        proposedShift,
        message: message.trim(),
      });
      toast.success(t('success'));
      onOpenChange(false);
      onProposed();
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
          <DialogTitle>{t('title', { name: booking.customerName })}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proposedDate">{t('date')}</Label>
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
            <Label htmlFor="proposedShift">{t('shift')}</Label>
            <Select required value={proposedShift} onValueChange={(value) => setProposedShift(value as Shift)}>
              <SelectTrigger id="proposedShift" className="w-full">
                <SelectValue placeholder={tShift('selectShift')} />
              </SelectTrigger>
              <SelectContent>
                {SHIFTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {labels.shift(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">{t('message')}</Label>
            <Textarea
              id="message"
              rows={3}
              placeholder={t('placeholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? tCommon('sending') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
