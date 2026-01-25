import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedCoreRoutes } from './ProtectedRoutes'
import { ROUTES, PAGES } from './constants'

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<PAGES.Login />} />
    <Route path={ROUTES.REGISTER} element={<PAGES.Register />} />

    {ProtectedCoreRoutes}

    <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} />} />
  </Routes>
)