export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  href: string;
}

export interface NotificationSnapshot {
  enabled: boolean;
  readAt: string;
  unreadCount: number;
  items: AppNotification[];
}

export async function consumeNotifications(response: Response, receive: (snapshot: NotificationSnapshot) => void) {
  if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
    throw new Error('Notification stream unavailable');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, '\n');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const event = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = event.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (data) receive(JSON.parse(data) as NotificationSnapshot);
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
