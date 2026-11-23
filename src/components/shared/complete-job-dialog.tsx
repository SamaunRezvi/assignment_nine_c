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
import { ImageUpload } from '@/components/shared/image-upload';
import { api } from '@/lib/api-client';
import { uploadToImgBB } from '@/lib/imgbb';
import type { Booking } from '@/lib/types';

export function CompleteJobDialog({
  booking,
  open,
  onOpenChange,
  onCompleted,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const t = useTranslations('completeDialog');
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('bookingDetail');
  const [finalAmount, setFinalAmount] = useState(String(booking.basePrice));
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (Number(finalAmount) <= 0) {
      toast.error(t('amountPositive'));
      return;
    }

    setSubmitting(true);
    try {
      const completionPhoto = photo ? await uploadToImgBB(photo) : undefined;

      await api.patch(`/api/bookings/${booking._id}/status`, {
        status: 'completed',
        finalAmount: Number(finalAmount),
        ...(completionPhoto ? { completionPhoto } : {}),
      });
      toast.success(t('success'));
      onOpenChange(false);
      onCompleted();
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
            <Label htmlFor="finalAmount">{t('finalAmount')}</Label>
            <Input
              id="finalAmount"
              type="number"
              min="1"
              required
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
            />
          </div>
          <ImageUpload
            id="completion-photo"
            label={t('photo')}
            value={photo}
            onChange={setPhoto}
            alt={tDetail('completedAlt')}
            disabled={submitting}
          />
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? tCommon('saving') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
