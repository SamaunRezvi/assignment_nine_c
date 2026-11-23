'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { SHIFTS, type Shift } from '@/lib/types';

interface LockedShift {
  date: string;
  shift: Shift;
}

export function ShiftLockPanel() {
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
      toast.success(action === 'lock' ? 'Shift locked' : 'Shift unlocked');
    } catch {
      toast.error('Could not update the shift lock');
    } finally {
      setBusy(false);
    }
  }

  function handleLock() {
    if (!date || !shift) {
      toast.error('Select a date and shift to lock');
      return;
    }
    void toggleLock({ date, shift }, 'lock');
    setDate('');
    setShift('');
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h2 className="font-semibold">Shift Locks</h2>
        <p className="text-sm text-muted-foreground">
          Lock a date and shift once you&apos;re done assigning time slots for it. New requests for that shift will stop.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lockDate">Date</Label>
          <Input id="lockDate" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lockShift">Shift</Label>
          <Select value={shift} onValueChange={(value) => setShift(value as Shift)}>
            <SelectTrigger id="lockShift" className="w-44">
              <SelectValue placeholder="Select a shift" />
            </SelectTrigger>
            <SelectContent>
              {SHIFTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleLock} disabled={busy}>
          <Lock className="h-4 w-4" /> Lock Shift
        </Button>
      </div>

      {lockedShifts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Currently locked</p>
          <ul className="space-y-2">
            {lockedShifts.map((entry) => {
              const label = SHIFTS.find((s) => s.value === entry.shift)?.label ?? entry.shift;
              return (
                <li key={`${entry.date}-${entry.shift}`} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                  <span>{entry.date} &middot; {label}</span>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => void toggleLock(entry, 'unlock')}>
                    <Unlock className="h-4 w-4" /> Unlock
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
