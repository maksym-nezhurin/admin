import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Center } from '@mantine/core';
import { Loader } from '../components/Loader';

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Center style={{width: '100vw'}}><Loader /></Center>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};
