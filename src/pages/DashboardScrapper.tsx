import type { FC } from 'react';

import { ScrapperTaskList } from '../components/Scrapper/ScrapperRequestList';

import { NavBar } from '../components/Scrapper/NavBar';

const DashboardScrapperPage: FC = () => {
    return (
        <>
            <NavBar />
            <ScrapperTaskList />
        </>
    );
}

export default DashboardScrapperPage;