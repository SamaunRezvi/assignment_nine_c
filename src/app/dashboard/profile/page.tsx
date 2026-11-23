'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/shared/image-upload';
import { AvailabilityManager } from '@/components/shared/availability-manager';
import { api } from '@/lib/api-client';
import { uploadToImgBB } from '@/lib/imgbb';
import { useAuth } from '@/lib/auth-context';
import { useLabels } from '@/i18n/use-format';
import { useErrorText } from '@/i18n/errors';
import type { AppUser } from '@/lib/types';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  if (!user) return null;

  return <ProfileForm key={user.email} user={user} refreshUser={refreshUser} />;
}

function ProfileForm({ user, refreshUser }: { user: AppUser; refreshUser: () => Promise<void> }) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const labels = useLabels();
  const errorText = useErrorText();
  const [name, setName] = useState(user.name ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [area, setArea] = useState(user.area ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState(user.unavailableDates ?? []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageUrl = image ? await uploadToImgBB(image) : undefined;

      await api.patch('/api/users/profile', {
        name,
        phone,
        area,
        bio,
        ...(imageUrl ? { image: imageUrl } : {}),
      });

      await refreshUser();
      setImage(null);
      toast.success(t('updated'));
    } catch (error) {
      toast.error(errorText(error, t('error')));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            id="profile-image"
            label={t('photo')}
            value={image}
            onChange={setImage}
            currentImage={user.image}
            alt={user.name}
            disabled={submitting}
            avatar
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{tAuth('email')}</Label>
              <Input value={user.email} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label>{tCommon('columns.role')}</Label>
              <Input value={labels.role(user.role)} readOnly disabled />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{tCommon('columns.phone')}</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">{t('area')}</Label>
              <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">{t('bio')}</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder={t('bioPlaceholder')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? tCommon('saving') : tCommon('saveChanges')}
          </Button>
        </form>
      </Card>

      {user.role === 'technician' && (
        <AvailabilityManager unavailableDates={unavailableDates} onChange={setUnavailableDates} />
      )}
    </div>
  );
}
