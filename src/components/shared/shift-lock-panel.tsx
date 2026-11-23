'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { SHIFTS, type Shift } from '@/lib/types';
import { useFormat, useLabels } from '@/i18n/use-format';

interface LockedShift {
  date: string;
  shift: Shift;
}

export function ShiftLockPanel() {
  const t = useTranslations('shiftLock');
  const labels = useLabels();
  const format = useFormat();
  const [lockedShifts, setLockedShifts] = useState<LockedShift[]>([]);
  const [date, setDate] = useState('');
  const [shift, setShift] = useState<Shift | ''>('');
  const [busy, setBusy] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  async function load() {
    try {
      const data = await api.get<{ lockedShifts: LockedShift[] }>('/api/users/shift-locks');
      setLockedShifts(data.lockedShifts ?? []);
    } catch {
      setLockedShifts([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggleLock(entry: LockedShift, action: 'lock' | 'unlock') {
    setBusy(true);
    try {
      const data = await api.patch<{ lockedShifts: LockedShift[] }>('/api/users/shift-lock', {
        date: entry.date,
        shift: entry.shift,
        action,
      });
      setLockedShifts(data.lockedShifts ?? []);
      toast.success(action === 'lock' ? t('locked') : t('unlocked'));
    } catch {
      toast.error(t('error'));
    } finally {
      setBusy(false);
    }
  }

  function handleLock() {
    if (!date || !shift) {
      toast.error(t('selectBoth'));
      return;
    }
    void toggleLock({ date, shift }, 'lock');
    setDate('');
    setShift('');
  }

  return (
    <div className="space-y-4 overflow-hidden rounded-lg border bg-card p-4">
      <div>
        <h2 className="font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full min-w-0 space-y-1.5 sm:flex-1">
          <Label htmlFor="lockDate">{t('date')}</Label>
          <Input id="lockDate" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="block w-full" />
        </div>
        <div className="min-w-0 space-y-1.5 sm:flex-1">
          <Label htmlFor="lockShift">{t('shift')}</Label>
          <Select value={shift} onValueChange={(value) => setShift(value as Shift)}>
            <SelectTrigger id="lockShift" className="w-full sm:w-44">
              <SelectValue placeholder={t('selectShift')} />
            </SelectTrigger>
            <SelectContent>
              {SHIFTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {labels.shift(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleLock} disabled={busy} className="w-full sm:w-auto">
          <Lock className="h-4 w-4" /> {t('lock')}
        </Button>
      </div>

      {lockedShifts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('currentlyLocked')}</p>
          <ul className="space-y-2">
            {lockedShifts.map((entry) => {
              return (
                <li key={`${entry.date}-${entry.shift}`} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                  <span>{format.date(entry.date)} &middot; {labels.shift(entry.shift)}</span>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => void toggleLock(entry, 'unlock')}>
                    <Unlock className="h-4 w-4" /> {t('unlock')}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
