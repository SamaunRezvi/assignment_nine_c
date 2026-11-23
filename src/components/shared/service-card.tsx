import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/shared/rating-stars';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { Service } from '@/lib/types';

export function ServiceCard({ service }: { service: Service }) {
  const t = useTranslations('services');
  const labels = useLabels();
  const format = useFormat();
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-48 w-full bg-muted">
        <Image src={service.image} alt={service.title} fill className="object-cover" />
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground">{labels.category(service.category)}</Badge>
      </div>
      <CardContent className="flex-1 space-y-2 pt-4">
        <h3 className="line-clamp-1 text-lg font-semibold">{service.title}</h3>
        <Link
          href={`/technicians/${encodeURIComponent(service.technicianEmail)}`}
          className="text-sm text-muted-foreground hover:text-primary hover:underline"
        >
          {t('by', { name: service.technicianName })}
        </Link>
        {service.averageRating !== undefined && (
          <RatingStars rating={service.averageRating} reviewCount={service.reviewCount} />
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {labels.serviceMode(service.serviceMode)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {labels.area(service.serviceArea)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-xs text-muted-foreground">{t('startingAt')}</p>
          <p className="text-lg font-bold text-primary">{format.currency(service.basePrice)}</p>
        </div>
        <Button asChild size="sm">
          <Link href={`/services/${service._id}`}>{t('viewDetails')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
