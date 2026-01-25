import React from 'react';
import { useRoles } from '../hooks/useRoles';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  level?: number;
  fallback?: React.ReactNode;
}

/**
 * 🛡️ Компонент для захисту маршрутів та елементів UI
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  level,
  fallback = null,
}) => {
  const { hasRole, hasMinimumLevel } = useRoles();
  // Перевірка ролей
  if (roles && !roles.some(role => hasRole(role))) {
    return <>{fallback}</>;
  }

  // Перевірка рівня
  if (level !== undefined && !hasMinimumLevel(level)) {
    return <>{fallback}</>;
  }

  // TODO: Додати перевірку permissions
  // const { hasPermission } = useRoles();
  // if (permissions && !await hasPermission(permissions)) {
  //   return <>{fallback}</>;
  // }

  return <>{children}</>;
};

/**
 * 🎯 HOC для обгортання компонентів
 */
export const withRoleGuard = (
  WrappedComponent: React.ComponentType<any>,
  options: Omit<RoleGuardProps, 'children'>
) => {
  return (props: any) => (
    <RoleGuard {...options}>
      <WrappedComponent {...props} />
    </RoleGuard>
  );
};

/**
 * 🎯 Alias for withRoleGuard for backward compatibility
 */
export const withRoleProtection = withRoleGuard;

/**
 * 🎯 Приклади використання:
 */

// 1. Захист по ролях
// <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
//   <AdminPanel />
// </RoleGuard>

// 2. Захист по рівню
// <RoleGuard level={80}>
//   <ManagerDashboard />
// </RoleGuard>

// 3. Комбінована перевірка
// <RoleGuard 
//   roles={['ADMIN']} 
//   level={60}
//   fallback={<AccessDenied />}
// >
//   <SensitiveData />
// </RoleGuard>

// 4. HOC використання
// const ProtectedComponent = withRoleGuard(MyComponent, {
//   roles: ['SUPER_ADMIN'],
//   fallback: <div>Access Denied</div>
// });
