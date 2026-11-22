import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="flex h-full flex-row items-start gap-3 p-4 transition-colors hover:border-primary">
              <action.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
