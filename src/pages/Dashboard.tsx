import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppShell,
  Navbar,
  Paper,
  Drawer,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useUIStore } from '../store/uiStore';
import { DashboardNav } from '../components/DashboardNav';
import { Header } from '../components/Header';

const DashboardPage: React.FC = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const isMobile = useMediaQuery('(max-width: 48em)'); // Mantine's 'sm' breakpoint

  return (
    <>
      {/* Drawer only for mobile */}
      {isMobile && (
        <Drawer
          withinPortal
          opened={sidebarOpen}
          onClose={closeSidebar}
          size={260}
          padding="md"
          title="Menu"
          zIndex={2000}
          styles={{
            inner: { left: 0 }
          }}
        >
          <DashboardNav />
        </Drawer>
      )}
      <AppShell
        padding="md"
        navbar={
          // Navbar only for desktop/tablet
          !isMobile ? (
            <Navbar width={{ base: 300 }} p="xs">
              <DashboardNav />
            </Navbar>
          ) : undefined
        }
        header={<Header />}
      >
        <Paper withBorder shadow="md" p={20} radius="md">
          <Outlet />
        </Paper>
      </AppShell>
    </>
  );
};

export default DashboardPage;