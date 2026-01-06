import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ApiClientProvider } from './contexts/ApiClientContext';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from './store/uiStore';

const queryClient = new QueryClient();

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useUIStore((state) => state.theme);
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{ colorScheme: theme }}
    >
      {children}
    </MantineProvider>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ApiClientProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </ApiClientProvider>
    </AuthProvider>
  </QueryClientProvider>
);