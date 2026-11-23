'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOCALE_COOKIE } from '@/i18n/config';

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchLanguage() {
    const next = locale === 'bn' ? 'en' : 'bn';
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Re-render the server tree so every page, including server-rendered
    // ones, picks up the new language without a full reload.
    startTransition(() => router.refresh());
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={switchLanguage}
      disabled={pending}
      aria-label={t('switchAria')}
      lang={locale === 'bn' ? 'en' : 'bn'}
      className={className}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {t('switchLabel')}
    </Button>
  );
}
