'use client';

import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/lib/notification-context';
import { formatDateTime } from '@/lib/helpers';

export function NotificationBell() {
  const notifications = useNotifications();
  if (!notifications) return null;
  const { snapshot, status, busy, error, setEnabled, markAllRead } = notifications;
  const unread = snapshot?.unreadCount ?? 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          {snapshot?.enabled === false ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {unread > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">{unread > 99 ? '99+' : unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Notifications</h2>
            <span className="text-xs text-muted-foreground" role="status">{error ? 'Reconnecting...' : status}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="live-notifications" className="text-sm">Live order alerts</Label>
            <Switch id="live-notifications" checked={snapshot?.enabled ?? false} disabled={!snapshot || busy} onCheckedChange={value => void setEnabled(value)} />
          </div>
          {snapshot?.enabled === false && <p className="text-xs text-muted-foreground">Alerts are paused. Turn them on to receive live updates.</p>}
          {error && <p role="alert" className="text-xs text-muted-foreground">{error}</p>}
          <Button variant="ghost" size="sm" disabled={busy || !unread} onClick={() => void markAllRead()}>Mark all as read</Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!snapshot ? <p className="p-4 text-sm text-muted-foreground">Loading notifications...</p> : !snapshot.items.length ? <p className="p-4 text-sm text-muted-foreground">No notifications yet. New requests and order updates will appear here.</p> : snapshot.items.map(item => (
            <Link key={item.id} href={item.href} className={`block space-y-1 border-b p-4 text-sm transition-colors hover:bg-muted ${item.createdAt > snapshot.readAt ? 'bg-primary/5' : ''}`}>
              <p className="font-medium">{item.title}</p>
              <p className="break-words text-muted-foreground">{item.message}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
