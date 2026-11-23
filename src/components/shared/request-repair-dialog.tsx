'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { SHIFTS, type Service, type Shift } from '@/lib/types';
import { useLabels } from '@/i18n/use-format';
import { useErrorText } from '@/i18n/errors';

export function RequestRepairDialog({ service }: { service: Service }) {
  const t = useTranslations('requestDialog');
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const labels = useLabels();
  const errorText = useErrorText();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [shift, setShift] = useState<Shift | ''>('');
  const [problemDescription, setProblemDescription] = useState('');
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [shiftError, setShiftError] = useState('');
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [lockedShifts, setLockedShifts] = useState<{ date: string; shift: Shift }[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api
      .get<{ unavailableDates: string[]; lockedShifts: { date: string; shift: Shift }[] }>(
        `/api/technicians/${encodeURIComponent(service.technicianEmail)}`
      )
      .then((data) => {
        setUnavailableDates(data.unavailableDates ?? []);
        setLockedShifts(data.lockedShifts ?? []);
      })
      .catch(() => {
        setUnavailableDates([]);
        setLockedShifts([]);
      });
  }, [service.technicianEmail]);

  const isShiftLocked = (date: string, s: Shift | '') =>
    !!s && lockedShifts.some((entry) => entry.date === date && entry.shift === s);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDateError('');
    setShiftError('');

    if (unavailableDates.includes(preferredDate)) {
      setDateError(t('dateUnavailable'));
      return;
    }

    if (!shift) {
      setShiftError(t('needShift'));
      return;
    }

    if (isShiftLocked(preferredDate, shift)) {
      setShiftError(t('shiftLocked'));
      return;
    }

    if (problemDescription.trim().length < 20) {
      setError(t('minDescription'));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/bookings', {
        serviceId: service._id,
        phone,
        address,
        preferredDate,
        shift,
        problemDescription,
      });
      toast.success(t('success'));
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(errorText(err, t('activeRequest')));
      } else {
        toast.error(errorText(err, t('error')));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          {t('button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <DialogTitle>{t('sentTitle')}</DialogTitle>
            <p className="text-muted-foreground">
              {t('sentText', { name: service.technicianName })}
            </p>
            <Button asChild>
              <Link href="/dashboard/customer/bookings">{t('goToBookings')}</Link>
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('title', { service: service.title })}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('name')}</Label>
                  <Input value={user?.name ?? ''} readOnly disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>{tAuth('email')}</Label>
                  <Input value={user?.email ?? ''} readOnly disabled />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">{t('address')}</Label>
                <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferredDate">{t('preferredDate')}</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  required
                  min={today}
                  value={preferredDate}
                  onChange={(e) => {
                    setPreferredDate(e.target.value);
                    setDateError(unavailableDates.includes(e.target.value) ? t('dateUnavailable') : '');
                    setShiftError(
                      isShiftLocked(e.target.value, shift) ? t('shiftLocked') : ''
                    );
                  }}
                />
                {dateError && <p className="text-sm text-destructive">{dateError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shift">{t('preferredShift')}</Label>
                <Select
                  required
                  value={shift}
                  onValueChange={(value) => {
                    setShift(value as Shift);
                    setShiftError(
                      isShiftLocked(preferredDate, value as Shift) ? t('shiftLocked') : ''
                    );
                  }}
                >
                  <SelectTrigger id="shift" className="w-full">
                    <SelectValue placeholder={t('selectShift')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s} value={s} disabled={isShiftLocked(preferredDate, s)}>
                        {isShiftLocked(preferredDate, s) ? t('fullyBooked', { shift: labels.shift(s) }) : labels.shift(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shiftError && <p className="text-sm text-destructive">{shiftError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="problemDescription">{t('problemDescription')}</Label>
                <Textarea
                  id="problemDescription"
                  required
                  rows={4}
                  placeholder={t('problemPlaceholder')}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? tCommon('sending') : t('submit')}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
