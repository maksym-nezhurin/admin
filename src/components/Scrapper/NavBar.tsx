import { Paper, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ScrapperSelector } from './ScrapperSelector';
import { ScrapperNavigation } from './ScrapperNavigation';

import { Filters } from './Filters';

export const NavBar = () => {
    const { t } = useTranslation();

    return (
        <Stack spacing="md" style={{ flexDirection: 'row' }}>
            <div style={{ width: '100%' }}>
                <Paper withBorder shadow="md" p={20} mb={20} radius="md">
                    <h4>{t('scrapper.filter')}</h4>

                    <Filters />
                </Paper>
            </div>
            <div>
                <Paper withBorder shadow="md" p={20} mb={20} radius="md">
                    <h4>{t('scrapper.selector')}</h4>

                    <ScrapperSelector />

                    <h4>{t('scrapper.navigation')}</h4>

                    <ScrapperNavigation />
                </Paper>
            </div>
        </Stack>
    )
}