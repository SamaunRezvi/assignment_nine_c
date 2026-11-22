'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/lib/notification-context';

export function NotificationPreview() {
  const notifications = useNotifications();
  const items = notifications?.snapshot?.items.slice(0, 4) ?? [];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Recent Notifications</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">You are all caught up, no new notifications.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="block rounded-md transition-colors hover:bg-muted/50">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="truncate text-sm text-muted-foreground">{item.message}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
