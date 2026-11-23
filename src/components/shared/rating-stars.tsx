import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export function RatingStars({ rating, reviewCount, size = 'sm' }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
