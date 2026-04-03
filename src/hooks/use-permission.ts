import { usePermissions } from '@features/auth/store';
import type { Permission } from '@constants/permissions';

export function usePermission(permission: Permission): boolean {
  const permissions = usePermissions();
  return permissions.includes(permission);
}

export function useHasAnyPermission(perms: Permission[]): boolean {
  const permissions = usePermissions();
  return perms.some((p) => permissions.includes(p));
}
