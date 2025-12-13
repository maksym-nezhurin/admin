import loadable from '@loadable/component';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  SCRAPPER: '/scrapper',
  DASHBOARD: '/dashboard',

  /**
   * Under login routes
  * */
  PROFILE: 'profile',
  SETTINGS: 'settings',
  ANNOUNCEMENTS: 'announcements',
  ANNOUNCEMENT_DETAIL: 'announcements/:id',
  // PREVIEW_COMPONENTS: 'preview-components',
  MAIN: '', // index route under dashboard
}

export const PAGES = {
  Login: loadable(() => import('../pages/Login')),
  Register: loadable(() => import('../pages/Register')),
  Scrapper: loadable(() => import('../pages/Scrapper')),

  Dashboard: loadable(() => import('../pages/Dashboard')),
  Profile: loadable(() => import('../pages/Profile')),
  Settings: loadable(() => import('../pages/Settings')),
  Announcements: loadable(() => import('../pages/Announcements')),
  Announcement: loadable(() => import('../pages/Announcement')),
  // PreviewComponents: loadable(() => import('../pages/PreviewComponents')),
  Main: loadable(() => import('../pages/Main')),
}