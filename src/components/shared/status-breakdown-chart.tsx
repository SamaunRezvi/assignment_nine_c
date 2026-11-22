'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STATUS_LABEL } from '@/lib/helpers';
import type { Booking, BookingStatus } from '@/lib/types';

const STATUS_COLOR: Record<BookingStatus, string> = {
  requested: '#3b82f6',
  accepted: '#6366f1',
  'in-progress': '#f59e0b',
  completed: '#10b981',
  rejected: '#ef4444',
  cancelled: '#64748b',
};

export function StatusBreakdownChart({ bookings }: { bookings: Booking[] }) {
  const counts = bookings.reduce<Partial<Record<BookingStatus, number>>>((acc, booking) => {
    acc[booking.status] = (acc[booking.status] ?? 0) + 1;
    return acc;
  }, {});

  const data = (Object.keys(counts) as BookingStatus[]).map((status) => ({
    name: STATUS_LABEL[status],
    value: counts[status] ?? 0,
    color: STATUS_COLOR[status],
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-56 items-center justify-center text-sm text-muted-foreground">
        No bookings yet to chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
