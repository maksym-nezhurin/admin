import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';

// Define interfaces locally to avoid circular dependencies
interface PermissionCheck {
  action: string;
  resource: string;
  countryCode?: string;
  companyId?: string;
}

interface RoleOption {
  value: string;
  label: string;
  level: number;
  description?: string;
}

/**
 * 🎯 Hook для роботи з ролями та правами доступу
 */
export const useRoles = () => {
  const { userInfo, roles } = useAuth();

  // Перевірити конкретне право доступу
  const hasPermission = async (check: PermissionCheck): Promise<boolean> => {
    if (!userInfo?.id) return false;

    try {
      const response = await authService.hasPermission(
        userInfo.id,
        check.action,
        check.resource,
        check.countryCode
      );
      return response.hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  // Перевірити роль користувача
  const hasRole = (roleName: string): boolean => {
    if (!userInfo?.roles) return false;
    
    return userInfo.roles.some(userRole => 
      userRole.role.name === roleName
    );
  };

  // Перевірити мінімальний рівень ролі
  const hasMinimumLevel = (level: number): boolean => {
    console.log(roles);
    if (!userInfo?.roles) return false;
    return userInfo.roles.some(userRole => 
      userRole.role.level >= level
    );
  };

  // Отримати найвищу роль
  const getHighestRole = () => {
    if (!userInfo?.roles?.length) return null;
    
    return userInfo.roles.reduce((prev, current) => 
      prev.role.level > current.role.level ? prev : current
    ).role;
  };

  // Отримати опції для селекту ролей
  const getRoleOptions = (): RoleOption[] => {
    return (roles || []).map((role: any) => ({
      // Використовуємо ім'я ролі як value, щоб відправляти його на бекенд
      value: role.name,
      label: role.name,
      level: role.level || 0,
      description: role.description,
    }));
  };

  // Отримати доступні ролі для призначення
  const getAvailableRoles = async () => {
    try {
      const allRoles = await authService.getAllRoles();
      return allRoles.map((role: any) => ({
        // value = name, оскільки бекенд очікує масив ролей за ім'ям
        value: role.name,
        label: role.name,
        level: role.level || 0,
        description: role.description,
      }));
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return [];
    }
  };

  // Призначити ролі користувачу (масив імен ролей)
  const assignRole = async (userId: string, roles: string[]) => {
    try {
      await authService.assignRolesToUser(userId, roles);
      return true;
    } catch (error) {
      console.error('Failed to assign role:', error);
      return false;
    }
  };

  // Видалити роль у користувача
  const removeRole = async (userId: string, roleId: string) => {
    try {
      await authService.removeRoleFromUser(userId, roleId);
      return true;
    } catch (error) {
      console.error('Failed to remove role:', error);
      return false;
    }
  };

  // Отримати повні права доступу користувача
  const getUserPermissions = async (userId: string, countryCode?: string) => {
    try {
      return await authService.getUserPermissions(userId, countryCode);
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return null;
    }
  };

  return {
    // Дані
    roles: roles || [],
    
    // Перевірки
    hasPermission,
    hasRole,
    hasMinimumLevel,
    getHighestRole,
    
    // UI опції
    getRoleOptions,
    getAvailableRoles,
    
    // Управління ролями
    assignRole,
    removeRole,
    getUserPermissions,
  };
};

/**
 * 🎯 Hook для перевірки прав доступу в компонентах
 */
export const usePermission = (check: PermissionCheck) => {
  const { hasPermission } = useRoles();
  
  return hasPermission(check);
};

/**
 * 🎯 Hook для перевірки ролі в компонентах
 */
export const useRole = (roleName: string) => {
  const { hasRole } = useRoles();
  
  return hasRole(roleName);
};
