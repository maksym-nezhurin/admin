import React from 'react';
import { IconHome, IconSettings, IconLogout } from '@tabler/icons-react';
import { Menu, ActionIcon } from '@mantine/core';

const DashboardRightMenu: React.FC<{ logout: () => void }> = ({ logout }) => {
  return (
    <Menu position="bottom-end">
        <Menu.Target>
          <ActionIcon>
            <IconHome size={20} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>
            <IconSettings size={16} />
            Settings
          </Menu.Item>
          <Menu.Item onClick={logout}>
            <IconLogout size={16} />
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
  );
};

export default DashboardRightMenu;
