'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { formatCurrency } from '@/lib/helpers';
import type { ApprovalStatus, Service } from '@/lib/types';

const FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export default function AdminServicesPage() {
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
      toast.success(`${service.title} ${approvalStatus}`);
      loadServices();
    } catch {
      toast.error('Could not update this service');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Approval</h1>
          <p className="text-muted-foreground">Review services submitted by technicians.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading services...</p>
      ) : services.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          No services in this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                  <TableCell>{formatCurrency(service.basePrice)}</TableCell>
                  <TableCell>
                    <ApprovalBadge status={service.approvalStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    {service.approvalStatus !== 'approved' && (
                      <Button size="sm" className="mr-2" onClick={() => handleApproval(service, 'approved')}>
                        Approve
                      </Button>
                    )}
                    {service.approvalStatus !== 'rejected' && (
                      <Button size="sm" variant="destructive" onClick={() => handleApproval(service, 'rejected')}>
                        Reject
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
