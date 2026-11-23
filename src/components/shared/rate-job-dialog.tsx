'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import type { Booking } from '@/lib/types';
import { useErrorText } from '@/i18n/errors';

export function RateJobDialog({
  booking,
  open,
  onOpenChange,
  onRated,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRated: () => void;
}) {
  const t = useTranslations('rateDialog');
  const tCommon = useTranslations('common');
  const errorText = useErrorText();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('needRating'));
      return;
    }

    if (review.trim().length === 0) {
      toast.error(t('needReview'));
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/rating`, { rating, review: review.trim() });
      toast.success(t('success'));
      onOpenChange(false);
      onRated();
    } catch (error) {
      toast.error(errorText(error, t('error')));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { technician: booking.technicianName, service: booking.serviceTitle })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('yourRating')}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={t('starAria', { count: star })}
                  aria-pressed={rating === star}
                  disabled={submitting}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="review">{t('yourReview')}</Label>
            <Textarea
              id="review"
              required
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={t('placeholder')}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? tCommon('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
