'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/lib/notification-context';
import { useNotificationText } from '@/i18n/use-notification-text';

export function NotificationPreview() {
  const t = useTranslations('notifications');
  const notificationText = useNotificationText();
  const notifications = useNotifications();
  const items = notifications?.snapshot?.items.slice(0, 4) ?? [];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{t('recent')}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('allCaughtUp')}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="block rounded-md transition-colors hover:bg-muted/50">
                <p className="text-sm font-medium">{notificationText(item).title}</p>
                <p className="truncate text-sm text-muted-foreground">{notificationText(item).message}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
