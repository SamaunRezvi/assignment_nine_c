'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/shared/google-sign-in-button';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/lib/auth-context';
import { authRedirect } from '@/lib/auth-redirect';

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { user, loading, error: accountError, completeSignIn, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) router.replace(authRedirect(redirect, user.role));
  }, [user, loading, redirect, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({ email, password });

      if (error) {
        toast.error(error.message || 'Invalid email or password');
        return;
      }

      const profile = await completeSignIn(email);

      toast.success('Signed in successfully');
      router.replace(authRedirect(redirect, profile.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
        </div>

        {accountError && (
          <div role="alert" className="space-y-2 rounded-md border p-3 text-sm">
            <p>{accountError}</p>
            <Button variant="outline" onClick={() => void refreshUser().catch(() => {})}>Retry loading account</Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton callbackURL={`${CLIENT_URL}/sign-in${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-primary">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
}
