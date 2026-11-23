'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, LayoutDashboard, UserPen, LogOut } from 'lucide-react';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { LanguageSwitcher } from './language-switcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { authClient } from '@/lib/auth-client';
import { clearToken } from '@/lib/api-client';
import { dashboardPathForRole } from '@/lib/helpers';
import { useLabels } from '@/i18n/use-format';
import { toast } from 'sonner';

const NAV_LINKS = [
  { href: '/', label: 'home' },
  { href: '/services', label: 'services' },
  { href: '/about', label: 'about' },
] as const;

export function Navbar() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const labels = useLabels();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => { if (desktop.matches) setNavigationOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  async function handleSignOut() {
    setNavigationOpen(false);
    await authClient.signOut();
    clearToken();
    toast.success(tAuth('signedOut'));
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {user && <NotificationBell />}
          <div className="hidden items-center gap-3 md:flex">
            {loading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)]">
                  <DropdownMenuLabel className="flex flex-col gap-1">
                    <span className="font-semibold">{user.name}</span>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {labels.role(user.role)}
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(dashboardPathForRole(user.role))}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <UserPen className="mr-2 h-4 w-4" />
                    {t('updateProfile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">{t('signIn')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">{t('signUp')}</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label={t('openNavigation')}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72" onClick={event => {
              if ((event.target as HTMLElement).closest('a')) setNavigationOpen(false);
            }}>
              <SheetTitle className="sr-only">{t('navigationMenu')}</SheetTitle>
              <div className="mt-8 flex flex-col gap-6 px-4">
                <nav className="flex flex-col gap-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-base font-medium ${
                        pathname === link.href ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {t(link.label)}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-3 border-t pt-6">
                  {user ? (
                    <>
                      <Link href={dashboardPathForRole(user.role)} className="text-sm font-medium">
                        {t('dashboard')}
                      </Link>
                      <Link href="/dashboard/profile" className="text-sm font-medium">
                        {t('updateProfile')}
                      </Link>
                      <Button variant="outline" onClick={handleSignOut}>
                        {t('signOut')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/sign-in">{t('signIn')}</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/sign-up">{t('signUp')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
