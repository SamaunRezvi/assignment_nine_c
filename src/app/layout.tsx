import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { NotificationProvider } from '@/lib/notification-context';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'FixMate - Verified Device & Appliance Repair',
    template: '%s | FixMate',
  },
  description:
    'Book trusted technicians for phone, laptop, AC, fridge, TV and washing machine repairs. Track every job and pay only after the work is done.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster richColors position="top-center" />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
