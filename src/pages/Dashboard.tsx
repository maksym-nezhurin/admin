import React, { useEffect, useState } from 'react';
import { AppShell, Navbar, Header, Container, Text, Paper, NavLink, SimpleGrid } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import DashboardRightMenu from '../components/DashboardRightMenu';
import { carsService } from '../api/cars';
import { CarCard } from '../components/CarCard';
import type { ICar } from '../types/general';

export const Dashboard: React.FC = () => {
  const { userInfo, logout } = useAuth();
  
  const [selectedMenu, setSelectedMenu] = useState<string>('home');
  const [cars, setCars] = useState<ICar[]>([]);

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'home':
        return <Text>Welcome to the Home page</Text>;
      case 'settings':
        return <Text>Here are your settings</Text>;
      case 'profile':
        return <Text>Your profile details go here</Text>;
      default:
        return <Text>Select a menu item</Text>;
    }
  };

  useEffect(() => {
    const getData = async () => {
        const cars = await carsService.getCars();
        
        setCars(cars);
    }

    getData();
  }, [])

  return (
    <AppShell
      padding="md"
      navbar={<Navbar width={{ base: 300 }} p="xs">
        <NavLink label="Home" onClick={() => handleMenuClick('home')} />
        <NavLink label="Settings" onClick={() => handleMenuClick('settings')} />
        <NavLink label="Profile" onClick={() => handleMenuClick('profile')} />
      </Navbar>}
      header={
        <Header height={60} p="xs" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Header Content 1</Text>

            <DashboardRightMenu logout={logout} />
        </Header>
      }
      styles={(theme) => ({
        main: { backgroundColor: theme.colors.gray[0] }
      })}
    >
      <Container size="lg" mt="xl">
        <Text size="xl" weight={700} mb="md">Dashboard:</Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" height={200}>
            <Text size="md">
                Admin Dashboard
            </Text>

            <Text>Welcome, <b>{userInfo ? `${userInfo.name} (${userInfo.email})` : 'Guest'}</b>!</Text>
        </Paper>
    
        {/* Conditional content based on selected menu */}
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            {renderContent()}
        </Paper>

        {/* Cars section */}
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Text size="md">Cars:</Text>

             <SimpleGrid 
              cols={3} 
              spacing="lg" 
              breakpoints={[
                { maxWidth: 'lg', cols: 3 },
                { maxWidth: 'md', cols: 2 },
                { maxWidth: 'sm', cols: 1 },
              ]}
            >
              {cars.map((car, index) => (
                <CarCard key={index} {...car} />
              ))}
            </SimpleGrid>
        </Paper>
      </Container>
    </AppShell>
  );
};