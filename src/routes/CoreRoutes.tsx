import { Route } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { ROUTES, PAGES } from './constants'

export const CoreRoutes = (
  <Route
    path={ROUTES.DASHBOARD}
    element={
      <PrivateRoute>
        <PAGES.Dashboard />
      </PrivateRoute>
    }
  >
    <Route path={ROUTES.PROFILE} element={<PAGES.Profile />} />
    <Route path={ROUTES.SETTINGS} element={<PAGES.Settings />} />
    <Route path={ROUTES.ANNOUNCEMENTS} element={<PAGES.Announcements />} />
    <Route path={ROUTES.ANNOUNCEMENT_DETAIL} element={<PAGES.Announcement />} />
    <Route index element={<PAGES.Main />} />
  </Route>
)