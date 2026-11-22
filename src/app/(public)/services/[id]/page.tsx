import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RequestRepairGate } from '@/components/shared/request-repair-gate';
import { formatCurrency } from '@/lib/helpers';
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative mb-8 h-72 w-full overflow-hidden rounded-xl bg-muted sm:h-96">
        <Image src={service.image} alt={service.title} fill className="object-cover" priority />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <Badge className="mb-3">{service.category}</Badge>
            <h1 className="text-3xl font-bold tracking-tight">{service.title}</h1>
          </div>
          <p className="leading-relaxed text-muted-foreground">{service.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated Duration</p>
                <p className="font-medium">{service.estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Service Mode</p>
                <p className="font-medium">{service.serviceMode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4 sm:col-span-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Service Area</p>
                <p className="font-medium">{service.serviceArea}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Starting at</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(service.basePrice)}</p>
            </div>
            <RequestRepairGate service={service} />
          </Card>

          <Card className="space-y-2 p-6">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Technician</p>
            <p className="text-lg font-semibold">{service.technicianName}</p>
            <p className="text-sm text-muted-foreground">{service.serviceArea}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
