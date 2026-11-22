'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { PackagePlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ApprovalBadge } from '@/components/shared/approval-badge';
import { EditServiceDialog } from '@/components/shared/edit-service-dialog';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/helpers';
import type { Service } from '@/lib/types';

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  async function loadServices() {
    setLoading(true);
    try {
      const data = await api.get<Service[]>('/api/services/mine/list');
      setServices(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function handleToggleAvailability(service: Service, isAvailable: boolean) {
    try {
      await api.patch(`/api/services/${service._id}/availability`, { isAvailable });
      setServices((prev) => prev.map((s) => (s._id === service._id ? { ...s, isAvailable } : s)));
      toast.success(isAvailable ? 'Service is now available' : 'Service is now hidden');
    } catch {
      toast.error('Could not update availability');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/services/${deleteTarget._id}`);
      toast.success('Service deleted');
      setDeleteTarget(null);
      loadServices();
    } catch {
      toast.error('Could not delete the service');
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading your services...</p>;

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <PackagePlus className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">You have not added any services yet</p>
        <Button asChild>
          <Link href="/dashboard/technician/add-service">Add Your First Service</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
          <p className="text-muted-foreground">Manage the services you offer on FixMate.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/technician/add-service">Add Service</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Available</TableHead>
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
                <TableCell>{service.category}</TableCell>
                <TableCell>{formatCurrency(service.basePrice)}</TableCell>
                <TableCell>
                  <ApprovalBadge status={service.approvalStatus} />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={service.isAvailable}
                    onCheckedChange={(checked) => handleToggleAvailability(service, checked)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditTarget(service)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(service)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editTarget && (
        <EditServiceDialog
          service={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onUpdated={loadServices}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this service?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.title} will be removed permanently. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Keep Service
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
