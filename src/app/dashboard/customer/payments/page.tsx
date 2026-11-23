'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { formatCurrency, formatDate } from '@/lib/helpers';
import type { Payment } from '@/lib/types';

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Payment[]>('/api/payments/my')
      .then(setPayments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading payment history...</p>;

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <Receipt className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">No payments yet</p>
        <p className="text-sm text-muted-foreground">Your paid bookings will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">Every payment you have made on FixMate.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Paid On</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell className="font-medium">{payment.serviceTitle}</TableCell>
                <TableCell>{payment.technicianName}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                <TableCell>{formatDate(payment.paidAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(payment.bookingId).catch(() => toast.error('Could not download the invoice'))}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
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
