# 🎯 Система Ролей та Обмежень - Інструкція Використання

## 📋 Зміст

1. [Базові концепції](#базові-концепції)
2. [Приклади використання](#приклади-використання)
3. [Інтеграція в роутинг](#інтеграція-в-роутинг)
4. [Найкращі практики](#найкращі-практики)

## 🎯 Базові концепції

### Рівні ролей:
```
USER (40)      → Базовий користувач
MANAGER (60)   → Менеджер
ADMIN (80)     → Адміністратор
SUPER_ADMIN (100) → Супер адміністратор
```

### Типи перевірок:
1. **За назвою ролі** - `hasRole('ADMIN')`
2. **За рівнем ролі** - `hasMinimumLevel(80)`
3. **За конкретними правами** - `hasPermission({ action: 'read', resource: 'users' })`
4. **Захист компонентів** - `<RoleGuard roles={['ADMIN']}>`

## 📚 Приклади використання

### 1. Проста перевірка ролі
```tsx
import { useRole } from '../hooks/useRoles';

const MyComponent = () => {
  const isAdmin = useRole('ADMIN');
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      <UserContent />
    </div>
  );
};
```

### 2. Перевірка рівня ролі
```tsx
import { useRoles } from '../hooks/useRoles';

const ManagerDashboard = () => {
  const { hasMinimumLevel } = useRoles();
  
  if (!hasMinimumLevel(60)) {
    return <AccessDenied />;
  }
  
  return <DashboardContent />;
};
```

### 3. Захист цілих компонентів
```tsx
import { RoleGuard } from '../components/RoleGuard';

const ProtectedPage = () => {
  return (
    <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={<AccessDenied />}>
      <AdminSettings />
    </RoleGuard>
  );
};
```

### 4. Динамічний контент
```tsx
const UserDashboard = () => {
  const { hasRole, hasMinimumLevel } = useRoles();
  
  const getAvailableFeatures = () => {
    const features = ['basic_profile'];
    
    if (hasMinimumLevel(60)) features.push('team_management');
    if (hasRole('ADMIN')) features.push('user_management');
    if (hasRole('SUPER_ADMIN')) features.push('system_settings');
    
    return features;
  };
  
  return <Dashboard features={getAvailableFeatures()} />;
};
```

### 5. Навігація з ролями
```tsx
const Navigation = () => {
  const { hasRole, hasMinimumLevel } = useRoles();
  
  const menuItems = [
    { path: '/', label: 'Головна', requiredLevel: 0 },
    { path: '/profile', label: 'Профіль', requiredLevel: 40 },
    { path: '/users', label: 'Користувачі', requiredLevel: 80 },
    { path: '/settings', label: 'Налаштування', requiredRole: 'SUPER_ADMIN' },
  ];
  
  return (
    <nav>
      {menuItems.map(item => {
        const hasAccess = item.requiredRole 
          ? hasRole(item.requiredRole)
          : hasMinimumLevel(item.requiredLevel);
          
        return hasAccess && <NavLink to={item.path}>{item.label}</NavLink>;
      })}
    </nav>
  );
};
```

## 🔧 Інтеграція в роутинг

### Додати сторінку з прикладами:
```tsx
// в вашому файлі роутингу (наприклад, App.tsx або routes/index.tsx)
import RoleExamplesPage from '../pages/RoleExamplesPage';

const routes = [
  // ... існуючі роути
  {
    path: '/role-examples',
    element: <RoleExamplesPage />,
    // Опціонально: захист роута
    // element: (
    //   <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
    //     <RoleExamplesPage />
    //   </RoleGuard>
    // )
  },
];
```

### Захист роутів на рівні роутингу:
```tsx
import { RoleGuard } from '../components/RoleGuard';

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/*" element={
        <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
          <AdminRoutes />
        </RoleGuard>
      } />
      
      <Route path="/manager/*" element={
        <RoleGuard level={60}>
          <ManagerRoutes />
        </RoleGuard>
      } />
      
      <Route path="/*" element={<UserRoutes />} />
    </Routes>
  );
};
```

## 🎯 Найкращі практики

### 1. Використовуйте комбіновані перевірки
```tsx
// ❌ Погано:
if (hasRole('ADMIN') || hasRole('SUPER_ADMIN')) { ... }

// ✅ Добре:
<RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}> { ... } </RoleGuard>
```

### 2. Валідуйте на рівні UI та API
```tsx
// Frontend перевірка
const canDeleteUser = useRole('ADMIN');

// API також повинен перевіряти
@Roles(RoleName.ADMIN)
@Delete('users/:id')
async deleteUser(@Param('id') id: string) {
  // логіка видалення
}
```

### 3. Надавайте зворотний зв'язок
```tsx
const AdminButton = () => {
  const isAdmin = useRole('ADMIN');
  
  if (!isAdmin) {
    return (
      <Button disabled title="Потрібні права адміністратора">
        🚫 Недоступно
      </Button>
    );
  }
  
  return <Button onClick={handleAdminAction}>Адмін дія</Button>;
};
```

### 4. Використовуйте HOC для повторюваної логіки
```tsx
const withAdminProtection = (Component) => (props) => (
  <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
    <Component {...props} />
  </RoleGuard>
);

const ProtectedSettings = withAdminProtection(SettingsPage);
```

### 5. Кешуйте перевірки прав
```tsx
const usePermission = (check) => {
  const { hasPermission } = useRoles();
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    hasPermission(check).then(setResult);
  }, [check]);
  
  return result;
};
```

## 🚀 Додаткові можливості

### 1. Перевірка прав по країнах
```tsx
const canManageUsersInUA = usePermission({
  action: 'write',
  resource: 'users',
  countryCode: 'UA'
});
```

### 2. Динамічні ролі
```tsx
const DynamicRoleComponent = () => {
  const { getAvailableRoles } = useRoles();
  const [availableRoles, setAvailableRoles] = useState([]);
  
  useEffect(() => {
    getAvailableRoles().then(setAvailableRoles);
  }, []);
  
  return <RoleSelector roles={availableRoles} />;
};
```

### 3. Аудит дій
```tsx
const useAuditedAction = (action, resource) => {
  const { hasPermission } = useRoles();
  
  return async (userId) => {
    const canPerform = await hasPermission({ action, resource });
    
    if (canPerform) {
      // Логування дії
      await auditLog(userId, action, resource);
      return true;
    }
    
    return false;
  };
};
```

## 🔍 Дебагінг

### Перевірка поточного стану:
```tsx
const DebugInfo = () => {
  const { roles, hasRole, hasMinimumLevel, getHighestRole } = useRoles();
  
  return (
    <pre>
      {JSON.stringify({
        availableRoles: roles,
        highestRole: getHighestRole(),
        isAdmin: hasRole('ADMIN'),
        canManageUsers: hasMinimumLevel(80)
      }, null, 2)}
    </pre>
  );
};
```

## 📝 Підсумок

Система ролей гнучка та потужна. Використовуйте її для:
- ✅ Захисту UI компонентів
- ✅ Контролю доступу до роутів
- ✅ Динамічного відображення контенту
- ✅ Валідації на рівні форм
- ✅ Аудиту дій користувачів

Головне - пам'ятайте про безпеку на рівні бекенду!
