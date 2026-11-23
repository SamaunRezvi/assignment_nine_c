import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const t = useTranslations('payment');
  const tCommon = useTranslations('common');

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4">
      <Card className="w-full space-y-4 p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">{t('cancelledTitle')}</h1>
        <p className="text-muted-foreground">{t('cancelledText')}</p>
        <Button asChild className="w-full">
          <Link href="/dashboard/customer/bookings">{tCommon('tryAgain')}</Link>
        </Button>
      </Card>
    </div>
  );
}
