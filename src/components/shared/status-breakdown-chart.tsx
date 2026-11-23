'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { useFormat, useLabels } from '@/i18n/use-format';
import type { Booking, BookingStatus } from '@/lib/types';

const STATUS_COLOR: Record<BookingStatus, string> = {
  requested: '#3b82f6',
  accepted: '#6366f1',
  'in-progress': '#f59e0b',
  completed: '#10b981',
  rejected: '#ef4444',
  cancelled: '#64748b',
  'reschedule-proposed': '#f97316',
};

export function StatusBreakdownChart({ bookings }: { bookings: Booking[] }) {
  const t = useTranslations('dashboard.breakdown');
  const labels = useLabels();
  const format = useFormat();
  const [hovered, setHovered] = useState<string | null>(null);

  const counts = bookings.reduce<Partial<Record<BookingStatus, number>>>((acc, booking) => {
    acc[booking.status] = (acc[booking.status] ?? 0) + 1;
    return acc;
  }, {});

  const data = (Object.keys(counts) as BookingStatus[]).map((status) => ({
    name: labels.status(status),
    value: counts[status] ?? 0,
    color: STATUS_COLOR[status],
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-56 flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-medium text-muted-foreground">{t('empty')}</p>
        <p className="text-xs text-muted-foreground/70">{t('hint')}</p>
      </div>
    );
  }

  const active = data.find((item) => item.name === hovered);

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={hovered && hovered !== entry.name ? 0.35 : 1}
                  className="cursor-pointer outline-none transition-opacity"
                  onMouseEnter={() => setHovered(entry.name)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">{format.number(active ? active.value : total)}</span>
          <span className="max-w-20 truncate text-center text-xs text-muted-foreground">{active ? active.name : t('totalJobs')}</span>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-1.5 text-xs"
            onMouseEnter={() => setHovered(item.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-medium tabular-nums">{format.number(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
