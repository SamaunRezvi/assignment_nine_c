import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MapPin, Clock, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RequestRepairGate } from '@/components/shared/request-repair-gate';
import { RatingStars } from '@/components/shared/rating-stars';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { getFormat, getLabels } from '@/i18n/server';
import type { Service } from '@/lib/types';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

async function getService(id: string): Promise<Service | null> {
  const res = await fetch(`${SERVER_URL}/api/services/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  const t = await getTranslations('services');
  const labels = await getLabels();
  const format = await getFormat();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative mb-8 h-72 w-full overflow-hidden rounded-xl bg-muted sm:h-96">
        <Image src={service.image} alt={service.title} fill className="object-cover" priority />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <Badge className="mb-3">{labels.category(service.category)}</Badge>
            <h1 className="text-3xl font-bold tracking-tight">{service.title}</h1>
            {service.averageRating !== undefined && (
              <div className="mt-2">
                <RatingStars rating={service.averageRating} reviewCount={service.reviewCount} size="md" />
              </div>
            )}
          </div>
          <p className="leading-relaxed text-muted-foreground">{service.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t('estimatedDuration')}</p>
                <p className="font-medium">{service.estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t('serviceMode')}</p>
                <p className="font-medium">{labels.serviceMode(service.serviceMode)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4 sm:col-span-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t('serviceArea')}</p>
                <p className="font-medium">{labels.area(service.serviceArea)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">{t('startingAt')}</p>
              <p className="text-3xl font-bold text-primary">{format.currency(service.basePrice)}</p>
            </div>
            <RequestRepairGate service={service} />
          </Card>

          <Card className="space-y-2 p-6">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{t('technician')}</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/technicians/${encodeURIComponent(service.technicianEmail)}`}
                className="text-lg font-semibold hover:text-primary hover:underline"
              >
                {service.technicianName}
              </Link>
              {service.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-sm text-muted-foreground">{labels.area(service.serviceArea)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
