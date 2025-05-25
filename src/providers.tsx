import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
      >
        {children}
      </MantineProvider>
    </AuthProvider>
  </QueryClientProvider>
);