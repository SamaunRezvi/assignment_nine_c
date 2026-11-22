'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api-client';
import { uploadToImgBB } from '@/lib/imgbb';
import { useAuth } from '@/lib/auth-context';
import { ROLE_LABEL } from '@/lib/helpers';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhone(user.phone ?? '');
      setArea(user.area ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

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
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Could not update your profile');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Update Profile</h1>
        <p className="text-muted-foreground">Keep your contact information up to date.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="profile-image">Profile Photo</Label>
              <Input id="profile-image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={ROLE_LABEL[user.role]} readOnly disabled />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">Area</Label>
              <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Share a little about your experience"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
