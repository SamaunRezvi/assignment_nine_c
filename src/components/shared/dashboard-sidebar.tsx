'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { Logo } from './logo';
import { DASHBOARD_NAV } from '@/lib/nav-config';
import type { Role } from '@/lib/types';

export function DashboardSidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = DASHBOARD_NAV[role];

  return (
    <div className="flex min-h-full flex-col gap-6 bg-sidebar p-5 text-sidebar-foreground" onClick={event => {
      if ((event.target as HTMLElement).closest('a')) onNavigate?.();
    }}>
      <Logo className="[&>span:last-child]:text-sidebar-foreground" />
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
