'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Receipt, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { downloadInvoice } from '@/lib/download-invoice';
import { useFormat } from '@/i18n/use-format';
import type { Payment } from '@/lib/types';

export default function CustomerPaymentsPage() {
  const t = useTranslations('customerPayments');
  const tCommon = useTranslations('common');
  const tBookings = useTranslations('customerBookings');
  const format = useFormat();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Payment[]>('/api/payments/my')
      .then(setPayments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">{t('loading')}</p>;

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <Receipt className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">{t('empty')}</p>
        <p className="text-sm text-muted-foreground">{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('columns.service')}</TableHead>
              <TableHead>{tCommon('columns.technician')}</TableHead>
              <TableHead>{tCommon('columns.amount')}</TableHead>
              <TableHead>{tCommon('columns.transactionId')}</TableHead>
              <TableHead>{tCommon('columns.paidOn')}</TableHead>
              <TableHead className="text-right">{tCommon('columns.invoice')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell className="font-medium">{payment.serviceTitle}</TableCell>
                <TableCell>{payment.technicianName}</TableCell>
                <TableCell>{format.currency(payment.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                <TableCell>{format.date(payment.paidAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(payment.bookingId).catch(() => toast.error(tBookings('invoiceError')))}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {tCommon('download')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
