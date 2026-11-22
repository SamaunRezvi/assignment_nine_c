import { notFound } from 'next/navigation';
import { MapPin, PackageSearch } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ServiceCard } from '@/components/shared/service-card';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import type { TechnicianProfile } from '@/lib/types';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

async function getTechnician(email: string): Promise<TechnicianProfile | null> {
  const res = await fetch(`${SERVER_URL}/api/technicians/${encodeURIComponent(email)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function TechnicianProfilePage({ params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const technician = await getTechnician(decodeURIComponent(email));

  if (!technician) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar size="lg" className="size-20">
          <AvatarImage src={technician.image ?? undefined} alt={technician.name} />
          <AvatarFallback className="text-xl">{technician.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold tracking-tight">{technician.name}</h1>
            {technician.isVerified && <VerifiedBadge />}
          </div>
          {technician.area && (
            <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
              <MapPin className="h-3.5 w-3.5" />
              {technician.area}
            </p>
          )}
          {technician.bio && <p className="max-w-xl text-sm text-muted-foreground">{technician.bio}</p>}
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Services by {technician.name}</h2>

      {technician.services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No active services right now</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {technician.services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
