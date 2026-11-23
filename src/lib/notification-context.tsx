'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from './auth-context';
import { api, getToken } from './api-client';
import { consumeNotifications, type NotificationSnapshot } from './notification-stream';
import { useNotificationText } from '@/i18n/use-notification-text';

// status and error are message keys under "notifications".
interface NotificationContextValue {
  snapshot: NotificationSnapshot | null;
  status: 'connecting' | 'live' | 'reconnecting' | 'paused';
  busy: boolean;
  error: 'loadError' | null;
  setEnabled: (enabled: boolean) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user
    ? <AccountNotifications key={user.email}>{children}</AccountNotifications>
    : <NotificationContext.Provider value={null}>{children}</NotificationContext.Provider>;
}

function AccountNotifications({ children }: { children: React.ReactNode }) {
  const t = useTranslations('notifications');
  const notificationText = useNotificationText();
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<NotificationSnapshot | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'reconnecting'>('connecting');
  const [error, setError] = useState<'loadError' | null>(null);
  const [busy, setBusy] = useState(false);
  const latestSeen = useRef('');
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    const controller = new AbortController();
    let retry: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const data = await api.get<NotificationSnapshot>('/api/notifications', { signal: controller.signal });
        if (controller.signal.aborted) return;
        latestSeen.current = data.items[0]?.createdAt ?? '';
        seenIds.current = new Set(data.items.map(item => item.id));
        setSnapshot(data);
        setError(null);
      } catch {
        if (!controller.signal.aborted) {
          setError('loadError');
          retry = setTimeout(load, 5_000);
        }
      }
    }
    void load();
    return () => { controller.abort(); clearTimeout(retry); };
  }, []);

  const enabled = snapshot?.enabled;
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let retry: ReturnType<typeof setTimeout>;
    async function connect() {
      try {
        const token = getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/notifications/stream`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        await consumeNotifications(response, data => {
          if (controller.signal.aborted) return;
          const fresh = data.items.filter(item => !seenIds.current.has(item.id) && item.createdAt >= latestSeen.current && item.createdAt > data.readAt);
          if (data.enabled) for (const item of fresh.slice(0, 3).reverse()) {
            const text = notificationText(item);
            toast(text.title, {
              description: text.message,
              action: { label: t('view'), onClick: () => router.push(item.href) },
            });
          }
          latestSeen.current = data.items[0]?.createdAt ?? latestSeen.current;
          seenIds.current = new Set(data.items.map(item => item.id));
          setSnapshot(data);
          setStatus('live');
          setError(null);
        });
      } catch {
        // Reconnect below; the API replays missed events from stored history.
      }
      if (!controller.signal.aborted) {
        setStatus('reconnecting');
        retry = setTimeout(connect, 2_000);
      }
    }
    void connect();
    return () => { controller.abort(); clearTimeout(retry); };
    // Text helpers change with the language; reconnecting for that is not needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, router]);

  async function setEnabled(value: boolean) {
    setBusy(true);
    try {
      const data = await api.patch<NotificationSnapshot>('/api/notifications/preferences', { enabled: value });
      // Re-enabling catches up in the feed without replaying old toast alerts.
      latestSeen.current = data.items[0]?.createdAt ?? '';
      seenIds.current = new Set(data.items.map(item => item.id));
      setSnapshot(data);
      setError(null);
    } catch {
      toast.error(t('preferenceError'));
    } finally { setBusy(false); }
  }

  async function markAllRead() {
    if (!snapshot?.items[0]) return;
    setBusy(true);
    try {
      setSnapshot(await api.patch<NotificationSnapshot>('/api/notifications/read', { readAt: snapshot.items[0].createdAt }));
    } catch {
      toast.error(t('markReadError'));
    } finally { setBusy(false); }
  }

  return <NotificationContext.Provider value={{ snapshot, status: enabled === false ? 'paused' : status, busy, error, setEnabled, markAllRead }}>
    {children}
  </NotificationContext.Provider>;
}
