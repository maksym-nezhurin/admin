import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppShell,
  Navbar,
  Paper,
} from '@mantine/core';
import { Header } from '../components/Header';
import { NavBar } from '../components/Scrapper/NavBar';
import { useMediaQuery } from '@mantine/hooks';

import { ScrapperSelector } from '../components/Scrapper/ScrapperSelector';
import { ScrapperNavigation } from '../components/Scrapper/ScrapperNavigation';

import { ScrapperProvider, useScrapper } from '../contexts/ScrapperContext';
import { Loader } from '../components/Loader';

const ScrapperContent: React.FC = () => {
    const isMobile = useMediaQuery('(max-width: 48em)'); // Mantine's 'sm' breakpoint
    const { loading } = useScrapper();

    return loading ?
     <Loader /> :
     (
        <AppShell
            padding="md"
            navbar={
            // Navbar only for desktop/tablet
            !isMobile ? (
                <Navbar width={{ base: 300 }} p="xs">
                    <NavBar />
                </Navbar>
            ) : undefined
            }
            header={<Header />}
        >
            <Paper withBorder shadow="md" p={20} radius="md">
                <ScrapperSelector />

                <ScrapperNavigation />

                <Outlet />
            </Paper>
        </AppShell>
    );
};

const ScrapperPage: React.FC = () => {
    return (
      <ScrapperProvider>
        <ScrapperContent />
      </ScrapperProvider>
    );
};

export default ScrapperPage;