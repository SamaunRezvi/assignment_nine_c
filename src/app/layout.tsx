import type { Metadata } from 'next';
import { Geist, Geist_Mono, Hind_Siliguri, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { NotificationProvider } from '@/lib/notification-context';
import { Toaster } from '@/components/ui/sonner';
import { FlashToast } from '@/components/shared/flash-toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
});

// Only the Bengali subset is loaded, so this font draws Bangla letters while
// English text keeps the site's existing typeface.
const hindSiliguri = Hind_Siliguri({
  variable: '--font-bangla',
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: {
      default: t('title'),
      template: '%s | FixMate',
    },
    description: t('description'),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${hindSiliguri.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
              {/* Start below the 64px sticky navbar so toasts never cover it. */}
              <Toaster
                richColors
                position="top-right"
                offset={{ top: 76, right: 16 }}
                mobileOffset={{ top: 76, right: 16 }}
                duration={3000}
              />
              <FlashToast />
            </NotificationProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
