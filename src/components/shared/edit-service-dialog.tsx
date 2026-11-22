'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { uploadToImgBB } from '@/lib/imgbb';
import { CATEGORIES } from '@/lib/types';
import type { Service } from '@/lib/types';

const SERVICE_MODES = ['Home Visit', 'Shop Drop-off'] as const;

export function EditServiceDialog({
  service,
  open,
  onOpenChange,
  onUpdated,
}: {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState(service.title);
  const [category, setCategory] = useState(service.category);
  const [description, setDescription] = useState(service.description);
  const [basePrice, setBasePrice] = useState(String(service.basePrice));
  const [estimatedDuration, setEstimatedDuration] = useState(service.estimatedDuration);
  const [serviceMode, setServiceMode] = useState(service.serviceMode);
  const [serviceArea, setServiceArea] = useState(service.serviceArea);
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageUrl = image ? await uploadToImgBB(image) : undefined;

      await api.patch(`/api/services/${service._id}`, {
        title,
        category,
        description,
        basePrice: Number(basePrice),
        estimatedDuration,
        serviceMode,
        serviceArea,
        ...(imageUrl ? { image: imageUrl } : {}),
      });

      toast.success('Service updated and sent for re-approval');
      onOpenChange(false);
      onUpdated();
    } catch {
      toast.error('Could not update the service');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Service['category'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Service Mode</Label>
              <Select value={serviceMode} onValueChange={(v) => setServiceMode(v as Service['serviceMode'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-basePrice">Base Price (USD)</Label>
              <Input
                id="edit-basePrice"
                type="number"
                min="1"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-duration">Estimated Duration</Label>
              <Input
                id="edit-duration"
                required
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-area">Service Area</Label>
            <Input
              id="edit-area"
              required
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-image">Replace Image (optional)</Label>
            <Input id="edit-image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
