import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Center } from '@mantine/core';
import { Loader } from '../components/Loader';

/** Where the user was headed before being sent to /login; read back by the Login page. */
export type LoginRedirectState = { from?: string };

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, initializing } = useAuth();
  const location = useLocation();

  if (initializing || loading) return <Center style={{width: '100vw'}}><Loader /></Center>;
  if (!user) {
    const state: LoginRedirectState = { from: `${location.pathname}${location.search}${location.hash}` };
    return <Navigate to="/login" replace state={state} />;
  }
  return <>{children}</>;
};
