'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '@/lib/types';
import { useState } from 'react';
import { useLabels } from '@/i18n/use-format';

const SERVICE_MODES = ['Home Visit', 'Shop Drop-off'];

const AREAS = ['Mirpur, Dhaka', 'Dhanmondi, Dhaka'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'newest' },
  { value: 'price-asc', label: 'priceAsc' },
  { value: 'price-desc', label: 'priceDesc' },
] as const;

export function ServiceFilters() {
  const t = useTranslations('services');
  const labels = useLabels();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam('search', search);
  }

  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-9"
        />
      </form>

      <Select value={searchParams.get('category') ?? 'all'} onValueChange={(v) => updateParam('category', v)}>
        <SelectTrigger className="w-full min-w-0">
          <SelectValue placeholder={t('category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allCategories')}</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {labels.category(c)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get('serviceMode') ?? 'all'} onValueChange={(v) => updateParam('serviceMode', v)}>
        <SelectTrigger className="w-full min-w-0">
          <SelectValue placeholder={t('serviceMode')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allModes')}</SelectItem>
          {SERVICE_MODES.map((m) => (
            <SelectItem key={m} value={m}>
              {labels.serviceMode(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get('area') ?? 'all'} onValueChange={(v) => updateParam('area', v)}>
        <SelectTrigger className="w-full min-w-0">
          <SelectValue placeholder={t('area')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allAreas')}</SelectItem>
          {AREAS.map((a) => (
            <SelectItem key={a} value={a}>
              {labels.area(a)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get('sort') ?? 'newest'} onValueChange={(v) => updateParam('sort', v)}>
        <SelectTrigger className="w-full min-w-0">
          <SelectValue placeholder={t('sortBy')} />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(`sort.${opt.label}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
