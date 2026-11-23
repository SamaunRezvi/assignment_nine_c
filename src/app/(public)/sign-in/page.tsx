'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/shared/google-sign-in-button';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/lib/auth-context';
import { authRedirect } from '@/lib/auth-redirect';
import { useErrorText } from '@/i18n/errors';

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

export default function SignInPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const errorText = useErrorText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { user, loading, error: accountError, completeSignIn, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [slowServer, setSlowServer] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      setRedirecting(true);
      router.replace(authRedirect(redirect, user.role));
    }
  }, [user, loading, redirect, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSlowServer(false);
    const slowTimer = setTimeout(() => setSlowServer(true), 6000);

    try {
      const { error } = await authClient.signIn.email({ email, password });

      if (error) {
        toast.error(errorText(error.message, t('signIn.invalid'), error.code));
        return;
      }

      const profile = await completeSignIn(email);

      toast.success(t('signIn.success'));
      setRedirecting(true);
      router.replace(authRedirect(redirect, profile.role));
    } catch (error) {
      toast.error(errorText(error, t('signIn.error')));
    } finally {
      clearTimeout(slowTimer);
      setSubmitting(false);
      setSlowServer(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('signIn.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('signIn.subtitle')}</p>
        </div>

        {accountError && (
          <div role="alert" className="space-y-2 rounded-md border p-3 text-sm">
            <p>{errorText(accountError, tErrors('loadAccount'))}</p>
            <Button variant="outline" onClick={() => void refreshUser().catch(() => {})}>{tCommon('retryAccount')}</Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t('password')}</Label>
            <PasswordInput
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting || redirecting}>
            {redirecting ? t('signIn.redirecting') : submitting ? t('signIn.submitting') : t('signIn.submit')}
          </Button>
          {submitting && slowServer && (
            <p className="text-center text-xs text-muted-foreground">{t('signIn.slowServer')}</p>
          )}
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{tCommon('or')}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton callbackURL={`${CLIENT_URL}/sign-in${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} />

        <p className="text-center text-xs text-muted-foreground">
          {t.rich('signIn.googleNote', {
            link: (chunks) => (
              <Link href="/sign-up" className="font-medium text-primary">
                {chunks}
              </Link>
            ),
          })}
        </p>

        <p className="text-center text-sm text-muted-foreground">
          {t('signIn.noAccount')}{' '}
          <Link href="/sign-up" className="font-medium text-primary">
            {t('signIn.signUpLink')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
