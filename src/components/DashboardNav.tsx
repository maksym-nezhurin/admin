import { Link, useLocation } from 'react-router-dom';
import { NavLink } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const getAvailablePages = (roleLevel: number) => {
    const pages = [
        { label: 'dashboard', path: '/', roleLevel: 10 },
        { label: 'scrapper', path: 'scrapper', roleLevel: 60 },
        { label: 'users', path: 'users', roleLevel: 100 },
        { label: 'profile', path: 'profile', roleLevel: 10 },
        { label: 'settings', path: 'settings', roleLevel: 10 },
        { label: 'announcements', path: 'announcements', roleLevel: 20 },
    ];
    return pages.filter(page => page.roleLevel <= roleLevel);
};

export const DashboardNav = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const { roleLevel } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname === `/${path}`;
    };

    const pages = roleLevel ? getAvailablePages(roleLevel.level) : [];

    if (pages.length > 0) {
        return (
            <>
                {pages.map((page) => (
                    <NavLink
                        key={page.path}
                        label={t(page.label)}
                        component={Link}
                        to={page.path}
                        active={isActive(page.path)}
                    />
                ))}
            </>
        );
    } else {
        return (
            <>
                <NavLink label={t('dashboard')} component={Link} to="/" active={isActive('/dashboard')} />
                <NavLink label={t('profile')} component={Link} to="profile" active={isActive('/dashboard/profile')} />
                <NavLink label={t('settings')} component={Link} to="settings" active={isActive('/dashboard/settings')} />
                <NavLink label={t('announcements')} component={Link} to="announcements" active={isActive('/dashboard/announcements')} />
            </>
        );
    }
};