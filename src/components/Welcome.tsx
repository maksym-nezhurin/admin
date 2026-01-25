import { Text, Title, Stack } from '@mantine/core';

import { useAuth } from '../contexts/AuthContext';
import { useTypedTranslation } from '../i18n';
import { useRoles } from '../hooks/useRoles';

const greetingKeyByRoleName: Record<string, string> = {
    SUPER_ADMIN: 'common.to_superadmin',
    ADMIN: 'common.to_admin',
    SCRAPPER: 'common.to_scrapper',
    MANAGER: 'common.to_manager',
    USER: 'common.to_user',
};

export const Welcome = () => {
    const { userInfo, roleLevel } = useAuth();  
    const { t } = useTypedTranslation();
    const { getHighestRole } = useRoles();
    const highestRole = getHighestRole(); // { name, level }
    const key = highestRole ? greetingKeyByRoleName[highestRole.name] ?? 'common.to_guest' : 'common.to_guest';

    return userInfo && roleLevel ? (
        <Stack>
            <Title order={2} mb={16}>{t('common.welcome')} <b>{userInfo?.firstName} {userInfo?.lastName && userInfo.lastName}</b> {t(key as any)}</Title>
            <Text mb={16}>{t('common.nav_hint')}</Text>
        </Stack>
    ) : null;
}