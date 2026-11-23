import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';

const FAQ_KEYS = ['booking', 'payment', 'becomeTechnician', 'pending', 'cancel', 'ratings', 'verified', 'support'] as const;

export default function FaqPage() {
  const t = useTranslations('faq');

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t('intro')}</p>
      </div>

      <div className="space-y-4">
        {FAQ_KEYS.map((key) => (
          <Card key={key} className="p-6">
            <h2 className="mb-2 font-semibold">{t(`items.${key}.question`)}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t(`items.${key}.answer`)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
