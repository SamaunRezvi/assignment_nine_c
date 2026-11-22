'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

interface GoogleSignInButtonProps {
  callbackURL: string;
}

export function GoogleSignInButton({ callbackURL }: GoogleSignInButtonProps) {
  async function handleClick() {
    await authClient.signIn.social({ provider: 'google', callbackURL });
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleClick}>
      <svg className="size-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.3h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.97h3.88c2.27-2.09 3.54-5.17 3.54-8.58z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-2.97c-1.08.72-2.45 1.15-4.05 1.15-3.12 0-5.76-2.1-6.7-4.93H1.3v3.07C3.28 21.3 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.3 14.34c-.24-.72-.38-1.49-.38-2.34s.14-1.62.38-2.34V6.59H1.3A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.3 5.41z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.33 0 3.28 2.7 1.3 6.59l4 3.11C6.24 6.87 8.88 4.77 12 4.77z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}
