import { CarCard } from '../components/CarCard';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { CreateCarAnnouncement } from '../components/CreateCarAnnouncement';
import { SimpleGrid, Button, Text, Modal} from  '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { carsService } from '../services/cars';
import { Loader } from '../components/Loader';
import { useAnnouncementsStore } from '../store/uiStore';

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
                <Text size="xl" weight={500}>Announcements:</Text>
                <Button onClick={open}>Create Car Announcement</Button>
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
                    <CarCard key={car.id} {...car} />
                ))}
            </SimpleGrid>
            <Modal
                opened={opened}
                onClose={close}
                title="Create Car Announcement"
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