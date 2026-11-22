'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
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
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    if (review.trim().length === 0) {
      toast.error('Please write a short review');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/rating`, { rating, review: review.trim() });
      toast.success('Thank you for your feedback');
      onOpenChange(false);
      onRated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit your rating');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate this job</DialogTitle>
          <DialogDescription>Share your experience with {booking.technicianName} for {booking.serviceTitle}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Your rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
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
            <Label htmlFor="review">Your review</Label>
            <Textarea
              id="review"
              required
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="How was the technician's work?"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
