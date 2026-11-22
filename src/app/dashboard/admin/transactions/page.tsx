'use client';

import { BadgeDollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLiveResource } from '@/lib/use-live-resource';
import { formatCurrency, formatDate } from '@/lib/helpers';
import type { Payment } from '@/lib/types';

interface TransactionsResponse {
  payments: Payment[];
  totalRevenue: number;
}

export default function AdminTransactionsPage() {
  const { data, loading, error, refresh } = useLiveResource<TransactionsResponse>('/api/admin/payments');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Every payment recorded through FixMate. Updates automatically.</p>
      </div>

      <Card className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BadgeDollarSign className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">{data ? formatCurrency(data.totalRevenue) : '...'}</p>
        </div>
      </Card>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border p-4 text-sm">
        <p>Could not load the latest transactions. {data ? 'Showing the last available update.' : 'Please try again.'}</p>
        <Button variant="outline" onClick={() => void refresh()}>Retry</Button>
      </div>}

      {loading ? (
        <p className="text-muted-foreground">Loading transactions...</p>
      ) : !data ? null : data.payments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          No payments recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Paid On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">{payment.serviceTitle}</TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell>{payment.technicianName}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                  <TableCell>{formatDate(payment.paidAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
