'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarX, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/helpers';

interface AvailabilityResponse {
  unavailableDates: string[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TechnicianAvailabilityPage() {
  const [dates, setDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<AvailabilityResponse>('/api/users/availability')
      .then((data) => setDates(data.unavailableDates))
      .catch(() => toast.error('Could not load your availability'))
      .finally(() => setLoading(false));
  }, []);

  async function handleBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;

    setSaving(true);
    try {
      const data = await api.patch<AvailabilityResponse>('/api/users/availability', { date: newDate, action: 'block' });
      setDates(data.unavailableDates);
      setNewDate('');
      toast.success('Date marked unavailable');
    } catch {
      toast.error('Could not update your availability');
    } finally {
      setSaving(false);
    }
  }

  async function handleUnblock(date: string) {
    setSaving(true);
    try {
      const data = await api.patch<AvailabilityResponse>('/api/users/availability', { date, action: 'unblock' });
      setDates(data.unavailableDates);
      toast.success('Date marked available');
    } catch {
      toast.error('Could not update your availability');
    } finally {
      setSaving(false);
    }
  }

  const sortedDates = [...dates].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">Block dates you cannot take on new jobs. Customers will not be able to request these dates.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleBlock} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="newDate" className="text-sm font-medium">Mark a date unavailable</label>
            <Input id="newDate" type="date" min={today()} value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full" />
          </div>
          <Button type="submit" disabled={!newDate || saving} className="w-full sm:w-auto">
            {saving ? 'Saving...' : 'Block Date'}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Blocked Dates</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : sortedDates.length === 0 ? (
          <Card className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center">
            <CalendarX className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No blocked dates. Customers can request any date.</p>
          </Card>
        ) : (
          <Card className="divide-y p-0">
            {sortedDates.map((date) => (
              <div key={date} className="flex items-center justify-between gap-3 p-4">
                <p className="font-medium">{formatDate(date)}</p>
                <Button variant="ghost" size="icon-sm" onClick={() => handleUnblock(date)} disabled={saving} aria-label={`Unblock ${date}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
