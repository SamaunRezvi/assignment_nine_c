'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badges';
import { BookingDetailDialog } from '@/components/shared/booking-detail-dialog';
import { api } from '@/lib/api-client';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { Booking } from '@/lib/types';

const STATUS_FILTERS = ['all', 'requested', 'accepted', 'in-progress', 'completed', 'rejected', 'cancelled'] as const;

export default function AdminBookingsPage() {
  const t = useTranslations('adminBookings');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const format = useFormat();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailTarget, setDetailTarget] = useState<Booking | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (search.trim()) params.set('search', search.trim());
    const query = params.toString() ? `?${params.toString()}` : '';

    const timer = setTimeout(() => {
      api
        .get<Booking[]>(`/api/admin/bookings${query}`)
        .then(setBookings)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f === 'all' ? tCommon('all') : labels.status(f)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t('loading')}</p>
      ) : bookings.length === 0 ? (
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
                <TableHead>{tCommon('columns.date')}</TableHead>
                <TableHead>{tCommon('columns.amount')}</TableHead>
                <TableHead>{tCommon('columns.status')}</TableHead>
                <TableHead>{tCommon('columns.payment')}</TableHead>
                <TableHead className="text-right">{tCommon('columns.details')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{booking.serviceTitle}</TableCell>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>{booking.technicianName}</TableCell>
                  <TableCell>{format.date(booking.preferredDate)}</TableCell>
                  <TableCell>{format.currency(booking.finalAmount)}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setDetailTarget(booking)}>
                      {tCommon('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BookingDetailDialog booking={detailTarget} viewerRole="admin" onOpenChange={(open) => !open && setDetailTarget(null)} />
    </div>
  );
}
