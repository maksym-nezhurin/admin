import loadable from '@loadable/component';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',

  /**
   * Under login routes
  * */
  PROFILE: 'profile',
  SETTINGS: 'settings',
  ANNOUNCEMENTS: 'announcements',
  ANNOUNCEMENT_DETAIL: 'announcements/:id',
  SCRAPPER: 'scrapper',
  SCRAPPER_TASK: 'task/:id',
  USERS: 'users',
  ADMIN: 'admin',
  SYSTEM: 'system',
  AUDIT: 'audit',
  ROLE_EXAMPLES: 'role-examples',
  // PREVIEW_COMPONENTS: 'preview-components',
  MAIN: '', // index route under dashboard

  /**
   * ADMIN
   */

}

export const LAYOUTS = {
  General: loadable(() => import('../layouts/General')),
  Scrapper: loadable(() => import('../layouts/Scrapper')),
};

export const PAGES = {
  Login: loadable(() => import('../pages/Login')),
  Register: loadable(() => import('../pages/Register')),
  // Scrapper: loadable(() => import('../pages/Scrapper')),
  Dashboard: loadable(() => import('../pages/Dashboard')),
  Main: loadable(() => import('../pages/Main')),
  Profile: loadable(() => import('../pages/Profile')),
  Settings: loadable(() => import('../pages/Settings')),
  Announcements: loadable(() => import('../pages/Announcements')),
  Announcement: loadable(() => import('../pages/Announcement')),
  DashboardScrapper: loadable(() => import('../pages/DashboardScrapper')),
  ScrapperTask: loadable(() => import('../pages/ScrapperItem')),
  Users: loadable(() => import('../pages/Users')),
  Admin: loadable(() => import('../pages/Admin')),
  System: loadable(() => import('../pages/System')),
  Audit: loadable(() => import('../pages/Audit')),
  RoleExamples: loadable(() => import('../pages/RoleExamplesPage')),
}