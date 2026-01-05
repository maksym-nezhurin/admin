import type { FC } from 'react';

import { ScrapperNavigation } from '../components/Scrapper/ScrapperRequestList';

import { NavBar } from '../components/Scrapper/NavBar';

const DashboardScrapperPage: FC = () => {
    return (
        <>
            <NavBar />
            <ScrapperNavigation />
        </>
    );
}

export default DashboardScrapperPage;