'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { dashboardPathForRole } from '@/lib/helpers';
import { useErrorText } from '@/i18n/errors';
import { useLabels } from '@/i18n/use-format';
import type { Role } from '@/lib/types';

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

// Returns a message key under auth.signUp, or null when the password is fine.
function passwordProblem(password: string) {
  if (password.length < 6) return 'passwordLength';
  if (!/[A-Z]/.test(password)) return 'passwordUpper';
  if (!/[a-z]/.test(password)) return 'passwordLower';
  return null;
}

export default function SignUpPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const errorText = useErrorText();
  const router = useRouter();
  const { user, loading, completeSignIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) router.replace(dashboardPathForRole(user.role));
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t('signUp.invalidEmail');
    }
    const problem = passwordProblem(password);
    if (problem) nextErrors.password = t(`signUp.${problem}`);
    if (confirmPassword !== password) nextErrors.confirmPassword = t('signUp.passwordMismatch');

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        ...({ role } as Record<string, unknown>),
      });

      if (error) {
        toast.error(errorText(error.message, t('signUp.error'), error.code));
        return;
      }

      const profile = await completeSignIn(email);

      toast.success(t('signUp.success'));
      router.replace(dashboardPathForRole(profile.role));
    } catch (error) {
      toast.error(errorText(error, t('signUp.error')));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('signUp.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('signUp.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('signUp.fullName')}</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t('password')}</Label>
            <PasswordInput
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t('signUp.confirmPassword')}</Label>
            <PasswordInput
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>{t('signUp.roleLabel')}</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['customer', 'technician'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                    role === r ? 'border-primary bg-primary/5 text-primary' : 'border-input'
                  }`}
                >
                  {labels.role(r)}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('signUp.submitting') : t('signUp.submit')}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{tCommon('or')}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton callbackURL={`${CLIENT_URL}${dashboardPathForRole('customer')}`} />

        <p className="text-center text-xs text-muted-foreground">{t('signUp.googleNote')}</p>

        <p className="text-center text-sm text-muted-foreground">
          {t('signUp.haveAccount')}{' '}
          <Link href="/sign-in" className="font-medium text-primary">
            {t('signUp.signInLink')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
