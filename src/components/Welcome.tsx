import { Text, Title, Stack } from '@mantine/core';

import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useRoles } from '../hooks/useRoles';

const greetingKeyByRoleName: Record<string, string> = {
    SUPER_ADMIN: 'to_superadmin',
    ADMIN: 'to_admin',
    SCRAPPER: 'to_scrapper',
    MANAGER: 'to_manager',
    USER: 'to_user',
};

export const Welcome = () => {
    const { userInfo, roleLevel } = useAuth();  
    const { t } = useTranslation();
    const { getHighestRole } = useRoles();
    const highestRole = getHighestRole(); // { name, level }
    const key = highestRole ? greetingKeyByRoleName[highestRole.name] ?? 'to_guest' : 'to_guest';

    return userInfo && roleLevel ? (
        <Stack>
            <Title order={2} mb={16}>{t('welcome')} <b>{userInfo?.firstName} {userInfo?.lastName && userInfo.lastName}</b> {t(key)}</Title>
            <Text mb={16}>{t('nav_hint')}</Text>
        </Stack>
    ) : null;
}