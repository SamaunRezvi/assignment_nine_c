import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RatingStars } from '@/components/shared/rating-stars';

interface RatingOverviewCardProps {
  averageRating: number | null;
  reviewCount: number;
}

export function RatingOverviewCard({ averageRating, reviewCount }: RatingOverviewCardProps) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Star className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Overall Rating</p>
        {averageRating === null ? (
          <p className="text-sm text-muted-foreground">No ratings yet</p>
        ) : (
          <RatingStars rating={averageRating} reviewCount={reviewCount} size="md" />
        )}
      </div>
    </Card>
  );
}
