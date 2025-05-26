import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Loader } from './components/Loader';
import { Announcements } from './pages/Announcements';
import { Announcement } from './pages/Announcement';
import { Main } from './pages/Main';
import { Center } from '@mantine/core';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Center><Loader /></Center>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    >
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      <Route path="announcements" element={<Announcements />} />
      <Route path="announcements/:id" element={<Announcement />} />
      <Route index element={<Main />} />
    </Route>
    <Route path="/" element={<Navigate to="/dashboard" />} />
  </Routes>
);