import { Group, Title } from "@mantine/core";
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Layout: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <>
            <Group dir="column">
                <Title>{t('scrapper.title')}</Title>
            </Group>

            <div>
                <Outlet />
            </div>
        </>
        
    )
}

export default Layout;