'use client';

import { useTranslations } from 'next-intl';
import { BadgeDollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/shared/stats-card';
import { useLiveResource } from '@/lib/use-live-resource';
import { useFormat } from '@/i18n/use-format';
import type { Payment } from '@/lib/types';

interface TransactionsResponse {
  payments: Payment[];
  totalRevenue: number;
}

export default function AdminTransactionsPage() {
  const t = useTranslations('adminTransactions');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const { data, loading, error, refresh } = useLiveResource<TransactionsResponse>('/api/admin/payments');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <StatsCard label={t('totalRevenue')} value={data ? format.currency(data.totalRevenue) : '...'} icon={BadgeDollarSign} />

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border p-4 text-sm">
        <p>{t('loadError')} {data ? t('showingLast') : t('pleaseRetry')}</p>
        <Button variant="outline" onClick={() => void refresh()}>{tCommon('retry')}</Button>
      </div>}

      {loading ? (
        <p className="text-muted-foreground">{t('loading')}</p>
      ) : !data ? null : data.payments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          {t('empty')}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCommon('columns.service')}</TableHead>
                <TableHead>{tCommon('columns.customer')}</TableHead>
                <TableHead>{tCommon('columns.technician')}</TableHead>
                <TableHead>{tCommon('columns.amount')}</TableHead>
                <TableHead>{tCommon('columns.transactionId')}</TableHead>
                <TableHead>{tCommon('columns.paidOn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">{payment.serviceTitle}</TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell>{payment.technicianName}</TableCell>
                  <TableCell>{format.currency(payment.amount)}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                  <TableCell>{format.date(payment.paidAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
