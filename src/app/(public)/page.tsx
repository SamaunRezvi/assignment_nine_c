import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  AirVent,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  Search,
  ClipboardCheck,
  Wrench,
  CreditCard,
  ShieldCheck,
  Timer,
  Star,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ServiceCard } from '@/components/shared/service-card';
import { HeroSlider } from '@/components/shared/hero-slider';
import { BecomeTechnicianButton } from '@/components/shared/become-technician-button';
import { getLabels } from '@/i18n/server';
import type { Service } from '@/lib/types';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const CATEGORY_ICONS = [
  { value: 'Smartphone', icon: Smartphone },
  { value: 'Laptop & PC', icon: Laptop },
  { value: 'AC', icon: AirVent },
  { value: 'Refrigerator', icon: Refrigerator },
  { value: 'TV', icon: Tv },
  { value: 'Washing Machine', icon: WashingMachine },
  { value: 'Electrical', icon: Zap },
];

const HOW_IT_WORKS = [
  { icon: Search, key: 'find' },
  { icon: ClipboardCheck, key: 'request' },
  { icon: Wrench, key: 'fix' },
  { icon: CreditCard, key: 'pay' },
] as const;

const TRUST_POINTS = [
  { icon: ShieldCheck, key: 'verified' },
  { icon: Timer, key: 'fast' },
  { icon: Star, key: 'payAfter' },
] as const;

async function getFeaturedServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${SERVER_URL}/api/services/featured`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getFeaturedServices();
  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');
  const labels = await getLabels();

  return (
    <div>
      <section className="relative isolate min-h-[32rem] overflow-hidden bg-primary text-primary-foreground sm:min-h-[36rem]">
        <HeroSlider />
        <div className="relative z-10 mx-auto flex min-h-[32rem] max-w-7xl items-center px-4 py-16 sm:min-h-[36rem] sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-6 [text-shadow:0_2px_14px_rgba(0,20,35,0.55)]">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {t('heroTitle')}
            </h1>
            <p className="text-lg text-primary-foreground/80">
              {t('heroText')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/services">{tCommon('browseServices')}</Link>
              </Button>
              <BecomeTechnicianButton />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('featuredTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('featuredSubtitle')}</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/services">{t('viewAll')}</Link>
          </Button>
        </div>

        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            {t('noServices')}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{t('howTitle')}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.key} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                </div>
                <p className="mb-1 text-sm font-semibold text-accent">{t('step', { step: i + 1 })}</p>
                <h3 className="mb-2 font-semibold">{t(`steps.${step.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`steps.${step.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{t('categoriesTitle')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORY_ICONS.map((cat) => (
            <Link key={cat.value} href={`/services?category=${encodeURIComponent(cat.value)}`}>
              <Card className="flex flex-col items-center gap-3 p-6 text-center transition-colors hover:border-primary">
                <cat.icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">{labels.category(cat.value)}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{t('whyTitle')}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <Card key={point.key} className="flex flex-col items-center gap-3 p-8 text-center">
                <point.icon className="h-9 w-9 text-accent" />
                <h3 className="font-semibold">{t(`trust.${point.key}.label`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`trust.${point.key}.value`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
