'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RatingStars } from '@/components/shared/rating-stars';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/helpers';

const CATEGORY_COLOR = ['#3b82f6', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#64748b', '#a855f7'];

interface AnalyticsData {
  revenueByDay: { date: string; revenue: number }[];
  bookingsByCategory: { category: string; count: number }[];
  technicianLeaderboard: { technicianName: string; technicianEmail: string; completedJobs: number; averageRating: number | null }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsData>('/api/admin/analytics').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading analytics...</p>;

  if (!data) return <p className="text-muted-foreground">Could not load analytics data.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Revenue, category demand and technician performance.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Revenue Over Time</h2>
          {data.revenueByDay.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No payments yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => formatDate(value)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)}
                  labelFormatter={(label) => (typeof label === 'string' ? formatDate(label) : '')}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Bookings by Category</h2>
          {data.bookingsByCategory.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No bookings yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.bookingsByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.bookingsByCategory.map((entry, index) => (
                    <Cell key={entry.category} fill={CATEGORY_COLOR[index % CATEGORY_COLOR.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Technician Leaderboard</h2>
        {data.technicianLeaderboard.length === 0 ? (
          <Card className="flex min-h-32 items-center justify-center p-6 text-sm text-muted-foreground">
            No completed jobs yet.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Completed Jobs</TableHead>
                  <TableHead>Average Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.technicianLeaderboard.map((tech) => (
                  <TableRow key={tech.technicianEmail}>
                    <TableCell className="font-medium">{tech.technicianName}</TableCell>
                    <TableCell>{tech.completedJobs}</TableCell>
                    <TableCell>
                      {tech.averageRating !== null ? (
                        <RatingStars rating={tech.averageRating} />
                      ) : (
                        <span className="text-sm text-muted-foreground">No ratings yet</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
