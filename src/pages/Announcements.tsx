import { CarCard } from '../components/CarCard';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { CreateCarAnnouncement } from '../components/CreateCarAnnouncement';
import { SimpleGrid, Button, Modal, Title } from  '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { carsService } from '../services/cars';
import { Loader } from '../components/Loader';
import { useAnnouncementsStore } from '../store/uiStore';
import { useTranslation } from 'react-i18next';
import type { ICar } from '../types/general';

const fetchAnnouncements = async () => {
    const response = await carsService.getCars();
    return response;
};

export const Announcements: React.FC = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['announcements'],
        queryFn: fetchAnnouncements,
    });
    const [opened, { open, close }] = useDisclosure(false);
    const announcements = useAnnouncementsStore(state => state.announcements);
    const { t } = useTranslation();
    const handleEdit = (car: ICar) => {
        // Logic to handle edit action
        console.log(`Edit announcement with ID: ${car.id}`);
    };
    const handleDelete = (id: string) => {
        // Logic to handle delete action
        console.log(`Delete announcement with ID: ${id}`);
    };

    React.useEffect(() => {
        if (data) {
            useAnnouncementsStore.getState().setAnnouncements(data);
        }
    }, [data]);

    if (isLoading) {
        return (
          <Loader />
        );
      }
    if (error instanceof Error) return <p>Error: {error.message}</p>;

    return (
        <>            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title order={2} mb={16}>{t('announcements')}</Title>
                <Button onClick={open}>{t('create_announcement')}</Button>
            </div> 

            <SimpleGrid 
                cols={3} 
                spacing="lg" 
                breakpoints={[
                    { maxWidth: 'lg', cols: 3 },
                    { maxWidth: 'md', cols: 2 },
                    { maxWidth: 'sm', cols: 1 },
                ]}
            >
                {(announcements || []).map((car) => (
                    <CarCard key={car.id} {...car} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
            </SimpleGrid>
            <Modal
                opened={opened}
                onClose={close}
                title={t('create_car_announcement')}
                size="lg"
                centered
                styles={{
                    inner: { left: 0 }
                }}
            >
                <CreateCarAnnouncement close={close} />
            </Modal>
        </>
    )
}