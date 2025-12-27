import { Text, Title, Stack } from '@mantine/core';

import { useAuth } from '../../contexts/AuthContext';

import { useTranslation } from 'react-i18next';

const checkUsetRoleGreeting = (roleLevel: number | undefined, t: (key: string) => string) => {
    switch (roleLevel) {
        case 100:
            return t('to_superadmin');
        case 80:
            return t('to_admin');
        case 60:
            return t('to_scrapper');
        case 40:
            return t('to_manager');
        case 10:
            return t('to_user');
        default:
            return t('to_guest');
    }
};

export const Welcome = () => {
    const { userInfo, roleLevel } = useAuth();
    const { t } = useTranslation();

    return userInfo && roleLevel ? (
        <Stack>
            <Title order={2} mb={16}>{t('welcome')} <b>{userInfo?.firstName} {userInfo?.lastName && userInfo.lastName}</b> {checkUsetRoleGreeting(roleLevel.level, t)}</Title>
            <Text mb={16}>{t('nav_hint')}</Text>
        </Stack>
    ) : null;
}