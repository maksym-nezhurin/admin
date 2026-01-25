import { Group, Title } from "@mantine/core";
import { Outlet } from 'react-router-dom';
import { useTypedTranslation } from '../i18n';

import { ApiClientSwitcher } from '../components/ApiClient/ApiClientSwitcher';
// import { ActiveUserSwitcher } from '../components/Scrapper/ActiveUserSwitcher';
import { RedisQueueStatus } from '../components/Scrapper/RedisQueueStatus';
import { ScrapperProvider } from "../contexts/ScrapperContext";
import { useAuth } from "../contexts/AuthContext";

const Layout: React.FC = () => {
    const { t } = useTypedTranslation();
    
    return (
        <>
            <Group dir="column">
                <Title order={2}>{t('scrapper.title')}</Title>
            </Group>

            <Group style={{ margin: '1rem 0', flexDirection: 'column', alignItems: 'flex-start' }} >
                <ApiClientSwitcher />

                {/* <ActiveUserSwitcher /> */}

                <RedisQueueStatus />
            </Group>

            <Outlet />
        </>
        
    )
}

const ScrapperLayout: React.FC = () => {
    const { userInfo } = useAuth();
    const { id } = userInfo || {};

    return (
      <ScrapperProvider userId={id || 'me'}>
        <Layout />
      </ScrapperProvider>
    );
};

export default ScrapperLayout;