import React from 'react';
import { IconSettings, IconLogout } from '@tabler/icons-react';
import { Menu, ActionIcon, Group, Avatar } from '@mantine/core';
import { Link } from 'react-router-dom';

type DashboardRightMenuProps = {
  name: string;
  logout: () => void;
};

const DashboardRightMenu: React.FC<DashboardRightMenuProps> = ({ name, logout }) => {
  return (
    <Menu position="bottom-end">
        <Menu.Target>
          <ActionIcon>
            <Group spacing="xs">
              <Avatar radius="xl" size="sm" color="blue">
                {name?.charAt(0).toUpperCase()}
              </Avatar>
            </Group>
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            icon={<IconSettings size={16} />}
            component={Link}
            to="settings"
          >
            Settings
          </Menu.Item>

          <Menu.Item
            icon={<IconLogout size={16} />}
            onClick={logout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
  );
};

export default DashboardRightMenu;
