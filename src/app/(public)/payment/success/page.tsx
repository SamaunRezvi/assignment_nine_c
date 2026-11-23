'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { useFormat } from '@/i18n/use-format';
import type { Payment } from '@/lib/types';

export default function PaymentSuccessPage() {
  const t = useTranslations('payment');
  const format = useFormat();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    api
      .get<Payment>(`/api/payments/verify?session_id=${sessionId}`)
      .then(setPayment)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4">
      <Card className="w-full space-y-4 p-8 text-center">
        {loading && sessionId ? (
          <p className="text-muted-foreground">{t('verifying')}</p>
        ) : error || !payment ? (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-xl font-bold">{t('failedTitle')}</h1>
            <p className="text-muted-foreground">{t('failedText')}</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="text-xl font-bold">{t('successTitle')}</h1>
            <p className="text-muted-foreground">
              {t('successText', { amount: format.currency(payment.amount), service: payment.serviceTitle })}
            </p>
            <p className="break-all font-mono text-xs text-muted-foreground">
              {t('transactionId', { id: payment.transactionId })}
            </p>
          </>
        )}
        <Button asChild className="w-full">
          <Link href="/dashboard/customer/bookings">{t('backToBookings')}</Link>
        </Button>
      </Card>
    </div>
  );
}
