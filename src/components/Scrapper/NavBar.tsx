import { Paper, Stack } from '@mantine/core';
import { ScrapperSelector } from './ScrapperSelector';
import { ScrapperNavigation } from './ScrapperNavigation';

import { Filters } from './Filters';

export const NavBar = () => {

    return (
        <Stack spacing="md" style={{ flexDirection: 'row' }}>
            <div style={{ width: '100%' }}>
                <Paper withBorder shadow="md" p={20} mb={20} radius="md">
                    <h4>Scrapper filter</h4>

                    <Filters />
                </Paper>
            </div>
            <div>
                <Paper withBorder shadow="md" p={20} mb={20} radius="md">
                    <h4>Scrapper Selector</h4>

                    <ScrapperSelector />

                    <h4>Scrapper Navigation</h4>

                    <ScrapperNavigation />

                </Paper>
            </div>
        </Stack>
    )
}