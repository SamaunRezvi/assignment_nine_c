'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSession } from './auth-client';
import { setToken, clearToken } from './api-client';
import type { AppUser } from './types';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  completeSignIn: (email: string) => Promise<AppUser>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  completeSignIn: async () => { throw new Error('Authentication is not ready'); },
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const sessionEmail = session?.user?.email;
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const inFlight = useRef<{ email: string; promise: Promise<AppUser> } | null>(null);

  const syncUser = useCallback((email: string): Promise<AppUser> => {
    email = email.trim().toLowerCase();
    if (inFlight.current?.email === email) return inFlight.current.promise;
    const requestId = ++generation.current;
    setLoading(true);
    setError(null);
    const promise = (async () => {
      try {
        const signal = AbortSignal.timeout(20_000);
        const jwtRes = await fetch('/api/jwt', {
          method: 'POST',
          credentials: 'include',
          signal,
        });
        if (!jwtRes.ok) throw new Error('Could not load your account. Please try again.');
        const { token } = await jwtRes.json();
        if (typeof token !== 'string' || !token) throw new Error('Could not start your session. Please try again.');

        const meRes = await fetch(`${SERVER_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });
        if (!meRes.ok) throw new Error('Could not load your profile. Please try again.');
        const profile: AppUser = await meRes.json();
        if (profile.email?.toLowerCase() !== email || !['admin', 'customer', 'technician'].includes(profile.role)) {
          throw new Error('Your account profile is invalid. Please contact support.');
        }
        if (requestId !== generation.current) throw new Error('Your session changed. Please sign in again.');
        setToken(token);
        setUser(profile);
        return profile;
      } catch (error) {
        const message = error instanceof Error && error.name === 'TimeoutError'
          ? 'The server is taking too long. Please try again.'
          : error instanceof TypeError ? 'Could not connect to the server. Please try again.'
          : error instanceof Error ? error.message : 'Could not load your account. Please try again.';
        if (requestId === generation.current) {
          clearToken();
          setUser(null);
          setError(message);
        }
        throw new Error(message);
      } finally {
        if (requestId === generation.current) {
          inFlight.current = null;
          setLoading(false);
        }
      }
    })();
    inFlight.current = { email, promise };
    return promise;
  }, []);

  const refreshUser = useCallback(async () => {
    if (sessionEmail) {
      await syncUser(sessionEmail);
    }
  }, [sessionEmail, syncUser]);

  const resetSession = useCallback(() => {
    generation.current++;
    inFlight.current = null;
    clearToken();
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isPending) return;
    let active = true;
    // Synchronize after BetterAuth has published its session change, rather
    // than exposing a half-initialized account to protected page redirects.
    queueMicrotask(() => {
      if (!active) return;
      if (!sessionEmail) resetSession();
      else void syncUser(sessionEmail).catch(() => {});
    });
    return () => { active = false; };
  }, [isPending, sessionEmail, syncUser, resetSession]);

  const syncingSession = !!session?.user?.email && user?.email !== session.user.email && !error;

  return (
    <AuthContext.Provider value={{ user, loading: loading || isPending || syncingSession, error, completeSignIn: syncUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
