import React from 'react';
import { Title, Text, Button, Card, Stack, Group, Badge } from '@mantine/core';
import { useRoles, useRole, usePermission } from '../hooks/useRoles';
import { RoleGuard } from '../components/RoleGuard';

/**
 * 🎯 Приклади використання системи ролей та обмежень
 */

// ======== 1. БАЗОВІ ПРИКЛАДИ ========

/**
 * Приклад 1: Проста перевірка ролі
 */
export const SimpleRoleCheck = () => {
  const isAdmin = useRole('ADMIN');
  const isSuperAdmin = useRole('SUPER_ADMIN');

  return (
    <Card shadow="sm" p="md">
      <Title order={4}>🔐 Проста перевірка ролі</Title>
      
      <Stack mt="sm">
        <Text>Статус доступу:</Text>
        <Group>
          <Badge color={isAdmin ? 'green' : 'red'}>
            ADMIN: {isAdmin ? '✅ Доступно' : '❌ Заблоковано'}
          </Badge>
          <Badge color={isSuperAdmin ? 'green' : 'red'}>
            SUPER_ADMIN: {isSuperAdmin ? '✅ Доступно' : '❌ Заблоковано'}
          </Badge>
        </Group>
        
        {isAdmin && (
          <Button color="blue">Адмін панель</Button>
        )}
        
        {isSuperAdmin && (
          <Button color="red" variant="light">
            Налаштування системи
          </Button>
        )}
      </Stack>
    </Card>
  );
};

/**
 * Приклад 2: Перевірка рівня ролі
 */
export const RoleLevelCheck = () => {
  const { hasMinimumLevel, getHighestRole } = useRoles();
  const highestRole = getHighestRole();

  return (
    <Card shadow="sm" p="md">
      <Title order={4}>📊 Перевірка рівня ролі</Title>
      
      <Stack mt="sm">
        <Text>Ваша найвища роль: <strong>{highestRole?.name || 'USER'}</strong></Text>
        <Text>Рівень: <strong>{highestRole?.level || 0}</strong></Text>
        
        <Group>
          <Badge color={hasMinimumLevel(40) ? 'green' : 'red'}>
            USER (40+): {hasMinimumLevel(40) ? '✅' : '❌'}
          </Badge>
          <Badge color={hasMinimumLevel(60) ? 'green' : 'red'}>
            MANAGER (60+): {hasMinimumLevel(60) ? '✅' : '❌'}
          </Badge>
          <Badge color={hasMinimumLevel(80) ? 'green' : 'red'}>
            ADMIN (80+): {hasMinimumLevel(80) ? '✅' : '❌'}
          </Badge>
          <Badge color={hasMinimumLevel(100) ? 'green' : 'red'}>
            SUPER_ADMIN (100+): {hasMinimumLevel(100) ? '✅' : '❌'}
          </Badge>
        </Group>
        
        {hasMinimumLevel(60) && (
          <Text color="green">✅ Доступ до менеджерських функцій</Text>
        )}
        
        {hasMinimumLevel(80) && (
          <Text color="blue">✅ Доступ до адмінських функцій</Text>
        )}
      </Stack>
    </Card>
  );
};

/**
 * Приклад 3: Перевірка конкретних прав
 */
export const PermissionCheck = () => {
  const [state, setState] = React.useState({
    canReadUsers: false,
    canWriteUsers: false,
    canDeleteUsers: false,
    canReadCompanies: false,
    canWriteCompanies: false,
  });

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const canReadUsers = await usePermission({ action: 'read', resource: 'users' });
      const canWriteUsers = await usePermission({ action: 'write', resource: 'users' });
      const canDeleteUsers = await usePermission({ action: 'delete', resource: 'users' });

      const canReadCompanies = await usePermission({ action: 'read', resource: 'companies' });
      const canWriteCompanies = await usePermission({ action: 'write', resource: 'companies' });

      if (!cancelled) {
        setState({
          canReadUsers,
          canWriteUsers,
          canDeleteUsers,
          canReadCompanies,
          canWriteCompanies,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    canReadUsers,
    canWriteUsers,
    canDeleteUsers,
    canReadCompanies,
    canWriteCompanies,
  } = state;

  return (
    <Card shadow="sm" p="md">
      <Title order={4}>🛡️ Перевірка конкретних прав</Title>
      
      <Stack mt="sm">
        <Text><strong>Права доступу до користувачів:</strong></Text>
        <Group>
          <Badge color={canReadUsers ? 'green' : 'red'}>
            Читати: {canReadUsers ? '✅' : '❌'}
          </Badge>
          <Badge color={canWriteUsers ? 'green' : 'red'}>
            Редагувати: {canWriteUsers ? '✅' : '❌'}
          </Badge>
          <Badge color={canDeleteUsers ? 'green' : 'red'}>
            Видаляти: {canDeleteUsers ? '✅' : '❌'}
          </Badge>
        </Group>
        
        <Text><strong>Права доступу до компаній:</strong></Text>
        <Group>
          <Badge color={canReadCompanies ? 'green' : 'red'}>
            Читати: {canReadCompanies ? '✅' : '❌'}
          </Badge>
          <Badge color={canWriteCompanies ? 'green' : 'red'}>
            Редагувати: {canWriteCompanies ? '✅' : '❌'}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
};

// ======== 2. ЗАХИСТ КОМПОНЕНТІВ ========

/**
 * Приклад 4: Захист цілих компонентів
 */
export const ProtectedComponents = () => {
  return (
    <Stack>
      <Title order={3}>🔒 Захищені компоненти</Title>
      
      {/* Доступно для всіх залогінених користувачів */}
      <RoleGuard roles={['USER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']}>
        <Card shadow="sm" p="md">
          <Text>👤 Базовий функціонал (для всіх користувачів)</Text>
        </Card>
      </RoleGuard>
      
      {/* Доступно тільки для менеджерів та вище */}
      <RoleGuard level={60}>
        <Card shadow="sm" p="md" bg="orange.0">
          <Text>📊 Менеджерський функціонал (рівень 60+)</Text>
        </Card>
      </RoleGuard>
      
      {/* Доступно тільки для адмінів */}
      <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
        <Card shadow="sm" p="md" bg="blue.0">
          <Text>⚙️ Адмінський функціонал</Text>
        </Card>
      </RoleGuard>
      
      {/* Доступно тільки для SUPER_ADMIN */}
      <RoleGuard roles={['SUPER_ADMIN']}>
        <Card shadow="sm" p="md" bg="red.0">
          <Text>🔧 Системні налаштування (SUPER_ADMIN тільки)</Text>
        </Card>
      </RoleGuard>
      
      {/* Комбінована перевірка */}
      <RoleGuard roles={['ADMIN']} level={80}>
        <Card shadow="sm" p="md" bg="green.0">
          <Text>✅ Комбінована перевірка (ADMIN + рівень 80+)</Text>
        </Card>
      </RoleGuard>
    </Stack>
  );
};

// ======== 3. ДИНАМІЧНІ КОМПОНЕНТИ ========

/**
 * Приклад 5: Динамічне відображення на основі ролей
 */
export const DynamicContent = () => {
  const { hasRole, hasMinimumLevel, getHighestRole } = useRoles();
  const highestRole = getHighestRole();

  const getUserDashboard = () => {
    if (hasRole('SUPER_ADMIN')) {
      return '🔧 Супер Адмін Панель';
    }
    if (hasRole('ADMIN')) {
      return '⚙️ Адмін Панель';
    }
    if (hasMinimumLevel(60)) {
      return '📊 Менеджер Панель';
    }
    return '👤 Користувацька Панель';
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (hasMinimumLevel(40)) {
      actions.push({ name: 'Перегляд профілю', color: 'blue' });
    }
    
    if (hasMinimumLevel(60)) {
      actions.push({ name: 'Керування командою', color: 'orange' });
    }
    
    if (hasRole('ADMIN')) {
      actions.push({ name: 'Керування користувачами', color: 'red' });
    }
    
    if (hasRole('SUPER_ADMIN')) {
      actions.push({ name: 'Системні налаштування', color: 'dark' });
    }
    
    return actions;
  };

  return (
    <Card shadow="sm" p="md">
      <Title order={4}>🎯 Динамічний контент</Title>
      
      <Stack mt="sm">
        <Text>Ваша панель: <strong>{getUserDashboard()}</strong></Text>
        <Text>Рівень доступу: <strong>{highestRole?.name || 'USER'}</strong></Text>
        
        <Text><strong>Доступні дії:</strong></Text>
        <Group>
          {getAvailableActions().map((action, index) => (
            <Button key={index} color={action.color} variant="light" size="sm">
              {action.name}
            </Button>
          ))}
        </Group>
      </Stack>
    </Card>
  );
};

// ======== 4. HOC ПРИКЛАДИ ========

/**
 * Приклад 6: Використання HOC для захисту
 */
const withAdminProtection = (WrappedComponent: React.ComponentType) => {
  return (props: any) => (
    <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={<div>Доступ заборонено</div>}>
      <WrappedComponent {...props} />
    </RoleGuard>
  );
};

const AdminSettings = () => <Text>🔧 Налаштування адміністратора</Text>;
const ProtectedAdminSettings = withAdminProtection(AdminSettings);

/**
 * Приклад 7: Сторінка з різними рівнями доступу
 */
export const AccessControlPage = () => {
  return (
    <Stack spacing="lg">
      <Title order={2}>🎯 Приклади системи контролю доступу</Title>
      
      <SimpleRoleCheck />
      <RoleLevelCheck />
      <PermissionCheck />
      <ProtectedComponents />
      <DynamicContent />
      
      <Card shadow="sm" p="md">
        <Title order={4}>🔧 HOC Приклад</Title>
        <ProtectedAdminSettings />
      </Card>
    </Stack>
  );
};

// ======== 5. РЕАЛЬНІ ПРИКЛАДИ ВИКОРИСТАННЯ ========

/**
 * Приклад 8: Навігаційне меню з ролями
 */
export const RoleBasedNavigation = () => {
  const { hasRole, hasMinimumLevel } = useRoles();

  const menuItems = [
    { label: 'Головна', path: '/', requiredLevel: 0 },
    { label: 'Профіль', path: '/profile', requiredLevel: 40 },
    { label: 'Команда', path: '/team', requiredLevel: 60 },
    { label: 'Користувачі', path: '/users', requiredLevel: 80 },
    { label: 'Налаштування', path: '/settings', requiredRole: 'SUPER_ADMIN' },
  ];

  return (
    <Card shadow="sm" p="md">
      <Title order={4}>🧭 Навігація з ролями</Title>
      
      <Stack mt="sm">
        {menuItems.map((item, index) => {
          const hasAccess = item.requiredRole 
            ? hasRole(item.requiredRole)
            : hasMinimumLevel(item.requiredLevel ?? 0);
            
          return (
            <Group key={index}>
              <Badge color={hasAccess ? 'green' : 'red'}>
                {hasAccess ? '✅' : '❌'}
              </Badge>
              <Text style={{ 
                opacity: hasAccess ? 1 : 0.5,
                textDecoration: hasAccess ? 'none' : 'line-through'
              }}>
                {item.label}
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Card>
  );
};

/**
 * Приклад 9: Форма з динамічними полями
 */
export const DynamicForm = () => {
  const { hasRole, hasMinimumLevel } = useRoles();

  return (
    <Card shadow="sm" p="md">
      <Title order={4}>📝 Форма з ролями</Title>
      
      <Stack mt="sm">
        <Text>Базові поля (для всіх):</Text>
        {/* ... базові поля ... */}
        
        {hasMinimumLevel(60) && (
          <>
            <Text>Менеджерські поля:</Text>
            {/* ... менеджерські поля ... */}
          </>
        )}
        
        {hasRole('ADMIN') && (
          <>
            <Text>Адмінські поля:</Text>
            {/* ... адмінські поля ... */}
          </>
        )}
        
        {hasRole('SUPER_ADMIN') && (
          <>
            <Text>Системні поля:</Text>
            {/* ... системні поля ... */}
          </>
        )}
      </Stack>
    </Card>
  );
};
