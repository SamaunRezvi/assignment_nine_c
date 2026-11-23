'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
import { ImageUpload } from '@/components/shared/image-upload';
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
import { useLabels } from '@/i18n/use-format';
import { useErrorText } from '@/i18n/errors';

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
  const t = useTranslations('serviceForm');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const errorText = useErrorText();
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

      toast.success(t('updated'));
      onOpenChange(false);
      onUpdated();
    } catch (error) {
      toast.error(errorText(error, t('updateError')));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">{t('title')}</Label>
            <Input id="edit-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('category')}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Service['category'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {labels.category(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('serviceMode')}</Label>
              <Select value={serviceMode} onValueChange={(v) => setServiceMode(v as Service['serviceMode'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {labels.serviceMode(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">{t('description')}</Label>
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
              <Label htmlFor="edit-basePrice">{t('basePrice')}</Label>
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
              <Label htmlFor="edit-duration">{t('estimatedDuration')}</Label>
              <Input
                id="edit-duration"
                required
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-area">{t('serviceArea')}</Label>
            <Input
              id="edit-area"
              required
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
            />
          </div>

          <ImageUpload
            id="edit-image"
            label={t('replaceImage')}
            value={image}
            onChange={setImage}
            currentImage={service.image}
            alt={service.title}
            disabled={submitting}
          />

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? tCommon('saving') : tCommon('saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
