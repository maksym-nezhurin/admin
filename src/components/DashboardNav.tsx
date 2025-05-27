import { Link, useLocation } from 'react-router-dom';
import { NavLink } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export const DashboardNav = () => {
    const location = useLocation();
    const { t } = useTranslation();

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname === `/${path}`;
    };

    return (
        <>
            <NavLink label={t('dashboard')} component={Link} to="/" active={isActive('/dashboard')} />
            <NavLink label={t('profile')} component={Link} to="profile" active={isActive('/dashboard/profile')} />
            <NavLink label={t('settings')} component={Link} to="settings" active={isActive('/dashboard/settings')} />
            <NavLink label={t('announcements')} component={Link} to="announcements" active={isActive('/dashboard/announcements')} />
      </>
    )
}