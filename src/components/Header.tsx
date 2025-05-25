import {
  Header as MantineHeader,
  Text,
  Group,
  Skeleton,
  Burger,
  MediaQuery,
} from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../store/uiStore';
import DashboardRightMenu from '../components/DashboardRightMenu';

export const Header = () => {
  const { userInfo, logout } = useAuth();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isLoading = !userInfo;

  return (
    <MantineHeader height={60} p="xs">
      <Group position="apart" align="center" h="100%">
        <Group>
            {isLoading ? (
                <Skeleton height={28} width={80} radius="xl" />
                ) : (
                <Text size="xl" weight={700}>
                    MyLogo
                </Text>
            )}
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Burger
                opened={sidebarOpen}
                onClick={toggleSidebar}
                size="sm"
                mr="xl"
                />
            </MediaQuery>
        </Group>

        

        <Group spacing="md">

          {isLoading ? (
            <>
              <Skeleton height={28} width={100} radius="xl" />
              <Skeleton height={36} circle />
            </>
          ) : (
            <DashboardRightMenu name={userInfo.name} logout={logout} />
          )}
        </Group>
      </Group>
    </MantineHeader>
  );
};