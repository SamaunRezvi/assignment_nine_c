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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ServiceCard } from '@/components/shared/service-card';
import { HeroScrollRing } from '@/components/shared/hero-scroll-ring';
import type { Service } from '@/lib/types';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const CATEGORY_ICONS = [
  { label: 'Smartphone', icon: Smartphone },
  { label: 'Laptop & PC', icon: Laptop },
  { label: 'AC', icon: AirVent },
  { label: 'Refrigerator', icon: Refrigerator },
  { label: 'TV', icon: Tv },
  { label: 'Washing Machine', icon: WashingMachine },
  { label: 'Electrical', icon: Zap },
];

const HOW_IT_WORKS = [
  { icon: Search, title: 'Find a Service', desc: 'Browse verified repair services by category or search for exactly what you need.' },
  { icon: ClipboardCheck, title: 'Send a Request', desc: 'Share the problem, your address and a preferred date in a quick request form.' },
  { icon: Wrench, title: 'Technician Fixes It', desc: 'A verified technician accepts the job and keeps you updated at every step.' },
  { icon: CreditCard, title: 'Pay After Completion', desc: 'Review the final amount and pay securely only once the job is done.' },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'Verified Technicians', value: 'Every provider is reviewed before listing' },
  { icon: Timer, label: 'Fast Response', value: 'Most requests get a reply within hours' },
  { icon: Star, label: 'Pay After Service', value: 'No upfront payment, ever' },
];

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

  return (
    <div>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Broken Device? Get It Fixed by Verified Technicians
            </h1>
            <p className="max-w-xl text-lg text-primary-foreground/80">
              Book trusted technicians for phones, laptops, ACs, fridges, TVs and more. Track every
              step of the job and pay only after the work is complete.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/sign-up">Become a Technician</Link>
              </Button>
            </div>
          </div>
          <HeroScrollRing />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Services</h2>
            <p className="mt-2 text-muted-foreground">Newly listed and ready to book</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/services">View All</Link>
          </Button>
        </div>

        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No services available yet. Check back soon.
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
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">How FixMate Works</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                </div>
                <p className="mb-1 text-sm font-semibold text-accent">Step {i + 1}</p>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">Popular Categories</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORY_ICONS.map((cat) => (
            <Link key={cat.label} href={`/services?category=${encodeURIComponent(cat.label)}`}>
              <Card className="flex flex-col items-center gap-3 p-6 text-center transition-colors hover:border-primary">
                <cat.icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">{cat.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">Why Choose FixMate</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <Card key={point.label} className="flex flex-col items-center gap-3 p-8 text-center">
                <point.icon className="h-9 w-9 text-accent" />
                <h3 className="font-semibold">{point.label}</h3>
                <p className="text-sm text-muted-foreground">{point.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
