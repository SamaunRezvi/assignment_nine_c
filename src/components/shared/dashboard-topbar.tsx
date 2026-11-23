'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown, Home, LayoutDashboard, LogOut, Menu, UserPen } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardSidebar } from './dashboard-sidebar';
import { NotificationBell } from './notification-bell';
import { LanguageSwitcher } from './language-switcher';
import { queueFlashToast } from './flash-toast';
import { dashboardPathForRole } from '@/lib/helpers';
import { authClient } from '@/lib/auth-client';
import { clearToken } from '@/lib/api-client';
import { useLabels } from '@/i18n/use-format';
import type { AppUser } from '@/lib/types';

export function DashboardTopbar({ user }: { user: AppUser }) {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const labels = useLabels();
  const [signingOut, setSigningOut] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setNavigationOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message);
      clearToken();
      queueFlashToast(tAuth('signedOut'));
      // Start a fresh document after ending the session so the protected
      // dashboard's redirect cannot race the navigation to the home page.
      window.location.replace('/');
    } catch {
      toast.error(tAuth('signOutError'));
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b bg-background px-4 sm:px-6">
      <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" aria-label={t('openDashboardNavigation')}>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 [&>[data-slot=sheet-close]]:text-sidebar-foreground">
          <SheetTitle className="sr-only">{t('dashboardNavigation')}</SheetTitle>
          <DashboardSidebar role={user.role} onNavigate={() => setNavigationOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden text-sm font-medium text-muted-foreground lg:block">
        {t('roleDashboard', { role: labels.role(user.role) })}
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <LanguageSwitcher />
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('openAccountMenu')}
              className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="hidden text-right sm:block">
                <p className="max-w-48 truncate text-sm font-medium">{user.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {labels.role(user.role)}
                </Badge>
              </div>
              <Avatar>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 max-w-[calc(100vw-2rem)]" sideOffset={8}>
            <DropdownMenuLabel className="flex flex-col gap-1 px-2 py-2">
              <span className="truncate font-semibold text-foreground">{user.name}</span>
              <Badge variant="secondary" className="w-fit text-xs">{labels.role(user.role)}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="min-h-10 cursor-pointer">
              <Link href={dashboardPathForRole(user.role)}>
                <LayoutDashboard /> {t('dashboard')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 cursor-pointer">
              <Link href="/dashboard/profile">
                <UserPen /> {t('updateProfile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 cursor-pointer">
              <Link href="/">
                <Home /> {t('backToHome')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={signingOut}
              className="min-h-10 cursor-pointer"
              onSelect={(event) => {
                event.preventDefault();
                void handleSignOut();
              }}
            >
              <LogOut /> {signingOut ? t('signingOut') : t('signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
