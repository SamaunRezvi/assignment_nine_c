'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/helpers';
import type { Payment } from '@/lib/types';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError(true);
      setLoading(false);
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
        {loading ? (
          <p className="text-muted-foreground">Verifying your payment...</p>
        ) : error || !payment ? (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-xl font-bold">Could not verify this payment</h1>
            <p className="text-muted-foreground">Please check your bookings or contact support.</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="text-xl font-bold">Payment Successful</h1>
            <p className="text-muted-foreground">
              You paid {formatCurrency(payment.amount)} for {payment.serviceTitle}.
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Transaction ID: {payment.transactionId}
            </p>
          </>
        )}
        <Button asChild className="w-full">
          <Link href="/dashboard/customer/bookings">Back to My Bookings</Link>
        </Button>
      </Card>
    </div>
  );
}
