import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // Same-origin path proxied to the API so auth cookies are first-party.
  baseURL: `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/auth`,
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
