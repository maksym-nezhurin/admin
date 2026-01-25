import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { RoleGuard, withRoleProtection } from '../components/RoleGuard';
import { ROUTES, PAGES, LAYOUTS } from './constants';
import { AccessDenied } from '../components/Restrictions/AccessDenied';

const DEFAULT_FALLBACK = <AccessDenied />;

/**
 * 🎯 Покращені роути з захистом на основі ролей
 */

// Компонент для захисту роутів за рівнем
const LevelProtectedRoute: React.FC<{
  level: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ level, children, fallback }) => (
  <RoleGuard level={level} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Компонент для захисту роутів за ролями
const RoleProtectedRoute: React.FC<{
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ roles, children, fallback }) => (
  <RoleGuard roles={roles} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Компонент для комбінованого захисту
const CombinedProtectedRoute: React.FC<{
  roles?: string[];
  level?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ roles, level, children, fallback = DEFAULT_FALLBACK }) => {
  if (roles && level) {
    return (
      <RoleGuard roles={roles} level={level} fallback={fallback}>
        {children}
      </RoleGuard>
    );
  }
  
  if (roles) {
    return (
      <RoleGuard roles={roles} fallback={fallback}>
        {children}
      </RoleGuard>
    );
  }
  
  if (level) {
    return (
      <RoleGuard level={level} fallback={fallback}>
        {children}
      </RoleGuard>
    );
  }
  
  return <>{children}</>;
};

/**
 * 🎯 Основні роути з захистом
 */
export const ProtectedCoreRoutes = (
  <Route
    path={ROUTES.DASHBOARD}
    element={
      <PrivateRoute>
        <LAYOUTS.General />
      </PrivateRoute>
    }
  >
    {/* Dashboard index page - redirects to main dashboard */}
    <Route index element={<PAGES.Dashboard />} />
    
    {/* Main dashboard route (alternative path) */}
    <Route 
      path={ROUTES.MAIN} 
      element={<PAGES.Dashboard />} 
    />
    
    {/* Базові роути для всіх залогінених (USER+) */}
    <Route 
      path={ROUTES.PROFILE} 
      element={
        <LevelProtectedRoute level={10}>
          <PAGES.Profile />
        </LevelProtectedRoute>
      } 
    />
    
    <Route 
      path={ROUTES.SETTINGS} 
      element={
        <LevelProtectedRoute level={40}>
          <PAGES.Settings />
        </LevelProtectedRoute>
      } 
    />

    <Route 
      path={ROUTES.ANNOUNCEMENTS} 
      element={
        <LevelProtectedRoute level={40}>
          <PAGES.Announcements />
        </LevelProtectedRoute>
      } 
    />
    
    <Route 
      path={ROUTES.ANNOUNCEMENT_DETAIL} 
      element={
        <LevelProtectedRoute level={40}>
          <PAGES.Announcement />
        </LevelProtectedRoute>
      } 
    />

    {/* Менеджерські роути (MANAGER+) */}
    <Route 
      path={ROUTES.SCRAPPER} 
      element={
        <LevelProtectedRoute level={60}>
          <LAYOUTS.Scrapper />
        </LevelProtectedRoute>
      }
    >
      <Route index element={<PAGES.DashboardScrapper />} />
      <Route path={ROUTES.SCRAPPER_TASK} element={<PAGES.ScrapperTask />} />
    </Route>

    {/* Адмінські роути (ADMIN+) */}
    <Route 
      path={ROUTES.USERS} 
      element={
        <LevelProtectedRoute level={80}>
          <PAGES.Users />
        </LevelProtectedRoute>
      } 
    />

    <Route 
      path={ROUTES.ADMIN} 
      element={
        <LevelProtectedRoute level={80}>
          <PAGES.Admin />
        </LevelProtectedRoute>
      } 
    />

    <Route 
      path={ROUTES.ROLE_EXAMPLES} 
      element={
        <LevelProtectedRoute level={80}>
          <PAGES.RoleExamples />
        </LevelProtectedRoute>
      } 
    />

    <Route 
      path={ROUTES.AUDIT} 
      element={
        <LevelProtectedRoute level={85}>
          <PAGES.Audit />
        </LevelProtectedRoute>
      } 
    />

    <Route 
      path={ROUTES.SYSTEM} 
      element={
        <LevelProtectedRoute level={90}>
          <PAGES.System />
        </LevelProtectedRoute>
      } 
    />

    {/* Роут для прикладів ролей */}
    <Route 
      path="role-examples" 
      element={
        <RoleProtectedRoute 
          roles={['ADMIN', 'SUPER_ADMIN']}
          fallback={<div>Доступ заборонено</div>}
        >
          {/* Імпортуємо сторінку з прикладами */}
          <PAGES.RoleExamples />
        </RoleProtectedRoute>
      } 
    />

    {/* Аудит роути */}
    <Route 
      path="audit" 
      element={
        <CombinedProtectedRoute 
          roles={['ADMIN', 'SUPER_ADMIN']}
          level={80}
          fallback={<div>Доступ заборонено</div>}
        >
          {/* Аудит сторінки */}
          <div>Аудит дій</div>
        </CombinedProtectedRoute>
      } 
    />
  </Route>
);

export const ProtectedSystemPage = withRoleProtection(() => <div>Система</div>, {
  roles: ['SUPER_ADMIN'],
  fallback: <div>Тільки для SUPER_ADMIN</div>
});
