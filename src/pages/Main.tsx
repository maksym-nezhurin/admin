import { Text, Paper, Table, Title, Stack } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { carsService } from '../services/cars';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Loader } from '../components/Loader';
import { CarAnalyticsChart } from '../components/CarAnalyticsChart';

export const Main = () => {
  const { userInfo } = useAuth();
  console.log('Main userInfo:', userInfo);
  const { t } = useTranslation();
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['all-announcements'],
    queryFn: () => carsService.getAllCars?.() ?? carsService.getCars(), // fallback to getCars if getAllCars not present
  });

  return isLoading ? <Loader /> : (
    <div>
      <Title order={2} mb={16}>{t('welcome')} <b>{userInfo?.firstName} {userInfo?.lastName && userInfo.lastName}</b> {t('to_admin')}</Title>
      <Text mb={16}>{t('nav_hint')}</Text>
      <Stack spacing="xl">
        <Paper p="md" withBorder shadow="sm">
          <Title order={4} mb={8}>{t('cars_by_date')}</Title>
          <CarAnalyticsChart cars={cars} userId={userInfo?.sub} />
        </Paper>
        <Paper p="md" withBorder shadow="sm">
          <Title order={4} mb={8}>{t('all_announcements')}</Title>
          <Table striped highlightOnHover withBorder>
            <thead>
              <tr>
                <th>{t('brand')}</th>
                <th>{t('model')}</th>
                <th>{t('year')}</th>
                <th>{t('owner')}</th>
                <th>{t('created')}</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(({ id, brand, model, year, ownerId, createdAt }) => (
                <tr key={id}>
                  <td>{brand}</td>
                  <td>{model}</td>
                  <td>{year}</td>
                  <td>{ownerId}</td>
                  <td>{createdAt ? format(new Date(createdAt), 'yyyy-MM-dd') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Paper>
      </Stack>
    </div>
  );
};