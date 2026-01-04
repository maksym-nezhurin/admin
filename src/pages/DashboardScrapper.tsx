import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Paper,
} from '@mantine/core';

import { useAuth } from '../contexts/AuthContext';

import { ScrapperNavigation } from '../components/Scrapper/ScrapperRequestList';

import { NavBar } from '../components/Scrapper/NavBar';

import { ScrapperProvider, useScrapper } from '../contexts/ScrapperContext';
import { Loader } from '../components/Loader';

const DashboardScrapperPage: FC = () => {
    const { loading } = useScrapper();

    return loading ?
     <Loader /> :
     (
        <>
            <NavBar />

            <Paper withBorder shadow="md" p={20} radius="md">

                <ScrapperNavigation />

                <Outlet />
            </Paper>
        </>
        
    );
}

const ScrapperPage: FC = () => {
    const { userInfo } = useAuth();
    const { id } = userInfo || {};

    return (
      <ScrapperProvider userId={id || 'me'}>
        <DashboardScrapperPage />
      </ScrapperProvider>
    );
};

export default ScrapperPage;