import type { ReactNode } from 'react';
import { usePermission } from '@hooks/use-permission';
import type { Permission } from '@constants/permissions';

interface Props {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ permission, fallback = null, children }: Props) {
  const has = usePermission(permission);
  return has ? <>{children}</> : <>{fallback}</>;
}
