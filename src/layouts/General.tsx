import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdvancedCollapsibleNav } from '../components/AdvancedCollapsibleNav';
import { useUIStore } from '../store/uiStore';
import { AppShell, Navbar, Drawer } from '@mantine/core';
import { Header } from '../components/Header';
import { Welcome } from '../components/Welcome';
import { useMediaQuery } from '@mantine/hooks';

export const General: React.FC = () => {
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
            size={340}
            padding="md"
            title="Menu"
            zIndex={2000}
            styles={{
                inner: { left: 0 }
            }}
            >
                <AdvancedCollapsibleNav />
            </Drawer>
        )}
        <AppShell
            padding="md"
            navbar={
            // Navbar only for desktop/tablet
            !isMobile ? (
                <Navbar width={{ base: 390 }} p="xs">
                    <AdvancedCollapsibleNav />
                </Navbar>
            ) : undefined
            }
            header={<Header />}
        >
            <>
                <Welcome />
                <Outlet />  
            </>
        </AppShell>
        </>
  );
};

export default General;