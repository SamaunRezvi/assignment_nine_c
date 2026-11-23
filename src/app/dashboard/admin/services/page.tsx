'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApprovalBadge } from '@/components/shared/approval-badge';
import { api } from '@/lib/api-client';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { ApprovalStatus, Service } from '@/lib/types';

const FILTERS = ['pending', 'approved', 'rejected', 'all'] as const;

export default function AdminServicesPage() {
  const t = useTranslations('adminServices');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const format = useFormat();
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  async function loadServices() {
    setLoading(true);
    try {
      const query = filter !== 'all' ? `?approvalStatus=${filter}` : '';
      const data = await api.get<Service[]>(`/api/admin/services${query}`);
      setServices(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleApproval(service: Service, approvalStatus: ApprovalStatus) {
    try {
      await api.patch(`/api/admin/services/${service._id}/approval`, { approvalStatus });
      toast.success(approvalStatus === 'approved' ? t('approved', { title: service.title }) : t('rejected', { title: service.title }));
      loadServices();
    } catch {
      toast.error(t('error'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f === 'all' ? tCommon('all') : labels.approval(f)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t('loading')}</p>
      ) : services.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          {t('empty')}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCommon('columns.service')}</TableHead>
                <TableHead>{tCommon('columns.technician')}</TableHead>
                <TableHead>{tCommon('columns.price')}</TableHead>
                <TableHead>{tCommon('columns.status')}</TableHead>
                <TableHead className="text-right">{tCommon('columns.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={service.image} alt={service.title} fill className="object-cover" />
                    </div>
                    <span className="font-medium">{service.title}</span>
                  </TableCell>
                  <TableCell>{service.technicianName}</TableCell>
                  <TableCell>{format.currency(service.basePrice)}</TableCell>
                  <TableCell>
                    <ApprovalBadge status={service.approvalStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    {service.approvalStatus !== 'approved' && (
                      <Button size="sm" className="mr-2" onClick={() => handleApproval(service, 'approved')}>
                        {tCommon('approve')}
                      </Button>
                    )}
                    {service.approvalStatus !== 'rejected' && (
                      <Button size="sm" variant="destructive" onClick={() => handleApproval(service, 'rejected')}>
                        {tCommon('reject')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
