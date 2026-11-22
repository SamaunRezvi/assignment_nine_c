'use client';

import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { DashboardSidebar } from './dashboard-sidebar';
import { ROLE_LABEL } from '@/lib/helpers';
import type { AppUser } from '@/lib/types';

export function DashboardTopbar({ user }: { user: AppUser }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <DashboardSidebar role={user.role} />
        </SheetContent>
      </Sheet>

      <div className="hidden text-sm font-medium text-muted-foreground lg:block">
        {ROLE_LABEL[user.role]} Dashboard
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{user.name}</p>
          <Badge variant="secondary" className="text-xs">
            {ROLE_LABEL[user.role]}
          </Badge>
        </div>
        <Avatar>
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
