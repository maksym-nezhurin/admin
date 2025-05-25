import { Link, useLocation } from 'react-router-dom';
import { NavLink } from '@mantine/core';

export const DashboardNav = () => {
    const location = useLocation();
    // Function to check if NavLink is active
    const isActive = (path: string) => {
        console.log(location.pathname, path, location.pathname === `/${path}`)
        return location.pathname === path || location.pathname === `/${path}`;
    };

    return (
        <>
            <NavLink label="Main" component={Link} to="/" active={isActive('/dashboard')} />
            <NavLink label="Profile" component={Link} to="profile" active={isActive('/dashboard/profile')} />
            <NavLink label="Settings" component={Link} to="settings" active={isActive('/dashboard/settings')} />
            <NavLink label="Announcements" component={Link} to="announcements" active={isActive('/dashboard/announcements')} />
      </>
    )
}