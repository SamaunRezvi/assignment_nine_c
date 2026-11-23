import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function StatsCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-6 text-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="truncate text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}
