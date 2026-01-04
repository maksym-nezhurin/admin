import { Text, Title, Stack, List } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const UsersPage = () => {
    const { t } = useTranslation();

    return <Stack>
        <Title>{t('users.header')}</Title>
        <Text>Please take a look:</Text>

        <List>
            <List.Item>First</List.Item>
        </List>
    </Stack>;
}

export default UsersPage;