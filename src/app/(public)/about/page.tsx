import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle2, ShieldCheck, Handshake, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';

const VALUES = [
  { icon: ShieldCheck, key: 'verified' },
  { icon: Handshake, key: 'communication' },
  { icon: Wallet, key: 'payAfter' },
] as const;

const STEPS = ['browse', 'request', 'accept', 'pay'] as const;

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>
      </div>

      <div className="mb-16 grid gap-6 sm:grid-cols-3">
        {VALUES.map((value) => (
          <Card key={value.key} className="space-y-3 p-6">
            <value.icon className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">{t(`values.${value.key}.title`)}</h3>
            <p className="text-sm text-muted-foreground">{t(`values.${value.key}.desc`)}</p>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl bg-secondary/40 p-8 sm:p-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{t('howTitle')}</h2>
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{t('stepLabel', { step: i + 1 })}</span>
                {t(`steps.${step}`)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        {t('moreQuestions')}{' '}
        <Link href="/faq" className="font-medium text-primary hover:underline">
          {t('visitFaq')}
        </Link>
      </p>
    </div>
  );
}
