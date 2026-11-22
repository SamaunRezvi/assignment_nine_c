'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarOff, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/helpers';

interface AvailabilityManagerProps {
  unavailableDates: string[];
  onChange: (dates: string[]) => void;
}

export function AvailabilityManager({ unavailableDates, onChange }: AvailabilityManagerProps) {
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const sorted = [...unavailableDates].sort();

  async function blockDate() {
    if (!date) return;
    setSubmitting(true);
    try {
      const data = await api.patch<{ unavailableDates: string[] }>('/api/users/availability', { date, action: 'block' });
      onChange(data.unavailableDates);
      setDate('');
      toast.success('Date marked unavailable');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update your availability');
    } finally {
      setSubmitting(false);
    }
  }

  async function unblockDate(target: string) {
    setSubmitting(true);
    try {
      const data = await api.patch<{ unavailableDates: string[] }>('/api/users/availability', { date: target, action: 'unblock' });
      onChange(data.unavailableDates);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update your availability');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center gap-2">
        <CalendarOff className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold">Availability</h2>
          <p className="text-sm text-muted-foreground">Block dates you cannot take on new repair jobs.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} disabled={submitting} />
        <Button type="button" onClick={blockDate} disabled={submitting || !date}>
          Block
        </Button>
      </div>

      {sorted.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {sorted.map((d) => (
            <li
              key={d}
              className="flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-sm"
            >
              {formatDate(d)}
              <button
                type="button"
                aria-label={`Unblock ${d}`}
                onClick={() => unblockDate(d)}
                disabled={submitting}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
