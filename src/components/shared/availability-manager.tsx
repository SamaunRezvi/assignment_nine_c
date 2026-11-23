'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { CalendarOff, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { useFormat } from '@/i18n/use-format';
import { useErrorText } from '@/i18n/errors';

interface AvailabilityManagerProps {
  unavailableDates: string[];
  onChange: (dates: string[]) => void;
}

export function AvailabilityManager({ unavailableDates, onChange }: AvailabilityManagerProps) {
  const t = useTranslations('availability');
  const format = useFormat();
  const errorText = useErrorText();
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
      toast.success(t('blocked'));
    } catch (error) {
      toast.error(errorText(error, t('updateError')));
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
      toast.error(errorText(error, t('updateError')));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center gap-2">
        <CalendarOff className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('managerSubtitle')}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} disabled={submitting} />
        <Button type="button" onClick={blockDate} disabled={submitting || !date}>
          {t('block')}
        </Button>
      </div>

      {sorted.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {sorted.map((d) => (
            <li
              key={d}
              className="flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-sm"
            >
              {format.date(d)}
              <button
                type="button"
                aria-label={t('unblockAria', { date: format.date(d) })}
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
