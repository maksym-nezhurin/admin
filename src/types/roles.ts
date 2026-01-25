/**
 * 🎯 Role System Types
 */

// Дія права доступу
export interface PermissionAction {
  action: string;    // 'read', 'write', 'delete'
  resource: string;  // 'users', 'companies', 'announcements'
  conditions?: any;  // Додаткові умови
}

// Хуки для перевірки прав доступу
export interface PermissionCheck {
  action: string;
  resource: string;
  countryCode?: string;
  companyId?: string;
}

// Глобальна роль (з UserRole)
export interface GlobalRole {
  id: string;
  name: string;
  level: number;
  description?: string;
  permissions?: RolePermission[];
}

// Права доступу для ролі
export interface RolePermission {
  roleId: string;
  countryCode: string;
  actions: PermissionAction[];
}

// Компанійне членство
export interface CompanyMembership {
  id: string;
  companyId: string;
  companyName: string;
  role: string;                    // Поточний string
  isSuperAdmin: boolean;
  countryPermissions?: any[];      // JSON permissions
  createdAt: string;
  updatedAt: string;
}

// Повна модель ролей користувача
export interface UserRoleSystem {
  user: {
    id: string;
    username: string;
    email: string;
    deletedAt?: string;
    isActive: boolean;
  };
  
  // Глобальні ролі
  globalRoles: GlobalRole[];
  
  // Компанійні членства
  companyMemberships: CompanyMembership[];
  
  // Об'єднані права доступу
  permissions: {
    global: RolePermission[];
    company: CompanyMembership[];
  };
  
  // Найвища роль
  highestRole: {
    name: string;
    level: number;
    source: 'global' | 'company';
  };
}

// Типи для UI компонентів
export interface RoleOption {
  value: string;
  label: string;
  level: number;
  description?: string;
}

export interface CompanyRoleOption {
  value: string;
  label: string;
  companyId: string;
  companyName: string;
}
