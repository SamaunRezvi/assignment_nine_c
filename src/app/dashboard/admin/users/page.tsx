'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { useLabels } from '@/i18n/use-format';
import { useAuth } from '@/lib/auth-context';
import type { AppUser, Role } from '@/lib/types';

const ROLES: Role[] = ['customer', 'technician', 'admin'];

export default function AdminUsersPage() {
  const t = useTranslations('adminUsers');
  const tCommon = useTranslations('common');
  const labels = useLabels();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.get<AppUser[]>('/api/admin/users');
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(targetUser: AppUser, role: Role) {
    try {
      await api.patch(`/api/admin/users/${targetUser._id}/role`, { role });
      toast.success(t('roleUpdated', { name: targetUser.name, role: labels.role(role) }));
      loadUsers();
    } catch {
      toast.error(t('error'));
    }
  }

  if (loading) return <p className="text-muted-foreground">{t('loading')}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('columns.user')}</TableHead>
              <TableHead>{tCommon('columns.email')}</TableHead>
              <TableHead>{tCommon('columns.role')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.image} alt={u.name} />
                    <AvatarFallback>{u.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{u.name}</span>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    disabled={u.email === currentUser?.email}
                    onValueChange={(role) => handleRoleChange(u, role as Role)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {labels.role(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
