'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSession } from './auth-client';
import { setToken, clearToken } from './api-client';
import type { AppUser } from './types';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (email: string) => {
    const jwtRes = await fetch(`${SERVER_URL}/api/jwt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!jwtRes.ok) {
      setUser(null);
      return;
    }

    const { token } = await jwtRes.json();
    setToken(token);

    const meRes = await fetch(`${SERVER_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (meRes.ok) {
      const profile = await meRes.json();
      setUser(profile);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (session?.user?.email) {
      await syncUser(session.user.email);
    }
  }, [session?.user?.email, syncUser]);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.email) {
      clearToken();
      setUser(null);
      setLoading(false);
      return;
    }

    syncUser(session.user.email).finally(() => setLoading(false));
  }, [isPending, session?.user?.email, syncUser]);

  return (
    <AuthContext.Provider value={{ user, loading: loading || isPending, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
