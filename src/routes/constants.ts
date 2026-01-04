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
  // PREVIEW_COMPONENTS: 'preview-components',
  MAIN: '', // index route under dashboard
}

export const LAYOUTS = {
  Scrapper: loadable(() => import('../layouts/Scrapper')),
};

export const PAGES = {
  Login: loadable(() => import('../pages/Login')),
  Register: loadable(() => import('../pages/Register')),
  Scrapper: loadable(() => import('../pages/Scrapper')),

  Dashboard: loadable(() => import('../pages/Dashboard')),
  Users: loadable(() => import('../pages/Users')),
  DashboardScrapper: loadable(() => import('../pages/DashboardScrapper')),
  ScrapperTask: loadable(() => import('../pages/ScrapperItem')),
  Profile: loadable(() => import('../pages/Profile')),
  Settings: loadable(() => import('../pages/Settings')),
  Announcements: loadable(() => import('../pages/Announcements')),
  Announcement: loadable(() => import('../pages/Announcement')),
  // PreviewComponents: loadable(() => import('../pages/PreviewComponents')),
  Main: loadable(() => import('../pages/Main')),
}