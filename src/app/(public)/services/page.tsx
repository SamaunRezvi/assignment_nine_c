import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { PackageSearch } from 'lucide-react';
import { ServiceCard } from '@/components/shared/service-card';
import { ServiceFilters } from '@/components/shared/service-filters';
import { Pagination } from '@/components/shared/pagination';
import type { Service } from '@/lib/types';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
}

async function getServices(searchParams: Record<string, string | undefined>): Promise<ServicesResponse> {
  const params = new URLSearchParams();
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.serviceMode) params.set('serviceMode', searchParams.serviceMode);
  if (searchParams.area) params.set('area', searchParams.area);
  if (searchParams.sort) params.set('sort', searchParams.sort);
  params.set('page', searchParams.page ?? '1');
  params.set('limit', '12');

  const res = await fetch(`${SERVER_URL}/api/services?${params.toString()}`, { cache: 'no-store' });

  if (!res.ok) {
    return { services: [], total: 0, page: 1, totalPages: 1 };
  }

  return res.json();
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { services, page, totalPages } = await getServices(params);
  const t = await getTranslations('services');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <Suspense>
        <ServiceFilters />
      </Suspense>

      {services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">{t('noMatch')}</p>
          <p className="text-sm text-muted-foreground">{t('noMatchHint')}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
          <Suspense>
            <Pagination page={page} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </div>
  );
}
