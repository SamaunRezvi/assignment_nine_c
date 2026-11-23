'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { useLabels } from '@/i18n/use-format';
import { useErrorText } from '@/i18n/errors';

const SERVICE_MODES = ['Home Visit', 'Shop Drop-off'] as const;

export default function AddServicePage() {
  const t = useTranslations('serviceForm');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const errorText = useErrorText();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [serviceMode, setServiceMode] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category || !serviceMode) {
      toast.error(t('selectBoth'));
      return;
    }

    if (!image) {
      toast.error(t('needImage'));
      return;
    }

    if (Number(basePrice) <= 0) {
      toast.error(t('pricePositive'));
      return;
    }

    setSubmitting(true);
    try {
      const imageUrl = await uploadToImgBB(image);

      await api.post('/api/services', {
        title,
        category,
        description,
        image: imageUrl,
        basePrice: Number(basePrice),
        estimatedDuration,
        serviceMode,
        serviceArea,
      });

      toast.success(t('added'));
      router.push('/dashboard/technician/my-services');
    } catch (error) {
      toast.error(errorText(error, t('addError')));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('addTitle')}</h1>
        <p className="text-muted-foreground">{t('addSubtitle')}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t('title')}</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectCategory')} />
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
              <Select value={serviceMode} onValueChange={setServiceMode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectMode')} />
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
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="basePrice">{t('basePrice')}</Label>
              <Input
                id="basePrice"
                type="number"
                min="1"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimatedDuration">{t('estimatedDuration')}</Label>
              <Input
                id="estimatedDuration"
                placeholder={t('durationPlaceholder')}
                required
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serviceArea">{t('serviceArea')}</Label>
            <Input
              id="serviceArea"
              placeholder={t('areaPlaceholder')}
              required
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
            />
          </div>

          <ImageUpload
            id="image"
            label={t('image')}
            value={image}
            onChange={setImage}
            alt={t('imageAlt')}
            disabled={submitting}
            required
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? tCommon('submitting') : t('submit')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
