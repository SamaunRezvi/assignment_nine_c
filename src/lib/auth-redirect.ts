import type { Role } from './types';
import { dashboardPathForRole } from './helpers';

export function authRedirect(redirect: string | null, role: Role): string {
  const fallback = dashboardPathForRole(role);
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//') || /[\\\r\n]/.test(redirect)) return fallback;
  const pathname = redirect.split(/[?#]/)[0];
  if (['/sign-in', '/sign-up'].includes(pathname)) return fallback;
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/profile' && pathname !== fallback && !pathname.startsWith(`${fallback}/`)) return fallback;
  return redirect;
}
