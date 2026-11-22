'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api-client';

// Keep the visible data current even when notification toasts are disabled.
export function useLiveResource<T>(path: string, interval = 3_000) {
  const [state, setState] = useState<{ path: string; data: T | null; error: string | null }>({ path, data: null, error: null });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const current = ++requestId.current;
    try {
      const data = await api.get<T>(path, { signal: abort.signal });
      if (!abort.signal.aborted && current === requestId.current) setState({ path, data, error: null });
    } catch (error) {
      if (!abort.signal.aborted && current === requestId.current) setState(previous => ({
        path, data: previous.path === path ? previous.data : null,
        error: error instanceof Error ? error.message : 'Could not load updates. Please try again.',
      }));
    }
  }, [path]);

  useEffect(() => {
    let active = true;
    let firstLoad = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      if (firstLoad || document.visibilityState !== 'hidden') await refresh();
      firstLoad = false;
      if (active) timer = setTimeout(poll, interval);
    }
    const onFocus = () => { if (document.visibilityState !== 'hidden') void refresh(); };
    void poll();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.current?.abort();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh, interval]);

  const current = state.path === path ? state : { data: null, error: null };
  return { ...current, loading: current.data === null && current.error === null, refresh };
}
