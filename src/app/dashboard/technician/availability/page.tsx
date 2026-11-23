'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { CalendarX, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { useFormat } from '@/i18n/use-format';

interface AvailabilityResponse {
  unavailableDates: string[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TechnicianAvailabilityPage() {
  const t = useTranslations('availability');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const [dates, setDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<AvailabilityResponse>('/api/users/availability')
      .then((data) => setDates(data.unavailableDates))
      .catch(() => toast.error(t('loadError')))
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
      toast.success(t('blocked'));
    } catch {
      toast.error(t('updateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleUnblock(date: string) {
    setSaving(true);
    try {
      const data = await api.patch<AvailabilityResponse>('/api/users/availability', { date, action: 'unblock' });
      setDates(data.unavailableDates);
      toast.success(t('unblocked'));
    } catch {
      toast.error(t('updateError'));
    } finally {
      setSaving(false);
    }
  }

  const sortedDates = [...dates].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleBlock} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="newDate" className="text-sm font-medium">{t('markLabel')}</label>
            <Input id="newDate" type="date" min={today()} value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full" />
          </div>
          <Button type="submit" disabled={!newDate || saving} className="w-full sm:w-auto">
            {saving ? tCommon('saving') : t('blockDate')}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">{t('blockedTitle')}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
        ) : sortedDates.length === 0 ? (
          <Card className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center">
            <CalendarX className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          </Card>
        ) : (
          <Card className="divide-y p-0">
            {sortedDates.map((date) => (
              <div key={date} className="flex items-center justify-between gap-3 p-4">
                <p className="font-medium">{format.date(date)}</p>
                <Button variant="ghost" size="icon-sm" onClick={() => handleUnblock(date)} disabled={saving} aria-label={t('unblockAria', { date: format.date(date) })}>
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
