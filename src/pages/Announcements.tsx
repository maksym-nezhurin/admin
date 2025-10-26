import {CarCard} from '../components/CarCard';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
// import {CreateCarAnnouncement} from '../components/Announcement/modals/CreateCarAnnouncement';
import {UpdateCarAnnouncement} from '../components/Announcement/modals/UpdateCarAnnouncement';
import {Button, Modal, SimpleGrid, Title} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {carsService} from '../services/cars';
import {charachteristicsService} from '../services/charachteristics';
import {Loader} from '../components/Loader';
import {useAnnouncementsStore} from '../store/uiStore';
import {useTranslation} from 'react-i18next';
import type {CarVariant, ICar} from '../types/car';

function transformCars(cars: CarVariant[]) {
  const uniqueModels = Array.from(new Map(
    cars.map(c => [c.name, { value: c.name, label: c.name }])
  ).values());

  const groupedByModel = cars.reduce<Record<string, CarVariant[]>>((acc, car) => {
    if (!acc[car.name]) acc[car.name] = [];
    acc[car.name].push(car);
    return acc;
  }, {});

  return { uniqueModels, groupedByModel };
}

const fetchAnnouncements = async () => {
    return await carsService.getCars();
};

const fetchCarAttributes = async () => {
    return await carsService.getCarAttributes();
}

const AnnouncementsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['announcements'],
        queryFn: fetchAnnouncements,
    });
    const { data: attributes = [] } = useQuery({
        queryKey: ['attributes'],
        queryFn: fetchCarAttributes,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => carsService.deleteCar(id),
        onSuccess: () => {
            // Automatically refetch announcements after deletion
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 5);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');

    // Generate years for select (e.g. 1990-2025)
    const years = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => {
    const y = (1990 + i).toString();
        return { value: y, label: y };
    }).reverse();

    const { data: brands = [], /* isLoading: brandsLoading */ } = useQuery({
        queryKey: ['brands', selectedYear],
        queryFn: () => charachteristicsService.getBrandsByYear(selectedYear),
        enabled: !!selectedYear,
    });

    const { data: models = [], /*isLoading: modelsLoading */ } = useQuery({
        queryKey: ['models', selectedBrand, selectedYear],
        queryFn: () => (selectedBrand && selectedYear) ? charachteristicsService.getModelsByBrandAndYear(selectedBrand, selectedYear) : Promise.resolve([]),
        enabled: !!selectedBrand && !!selectedYear,
    });

   const { uniqueModels, groupedByModel } = React.useMemo(
        () => transformCars(models),
        [models]
    );

    // const { data: variants = [], isLoading: variantsLoading } = useQuery({
    //     queryKey: ['variants', selectedModel],
    //     queryFn: () => selectedModel ? charachteristicsService.getVariantsByModelAndYear(selectedModel, selectedYear) : Promise.resolve([]),
    //     enabled: !!selectedModel,
    // });

    const modalProps = {
        selectedYear,
        setSelectedYear,
        selectedBrand,
        setSelectedBrand,
        selectedModel,
        setSelectedModel,
        selectedVariant,
        setSelectedVariant,
        years,
        attributes,
        brands,
        brandsLoading: false,
        models: uniqueModels,
        modelsLoading: false,
        variants: groupedByModel[selectedModel] || [],
        variantsLoading: false,
    };
    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [updateOpened, { open: openUpdate, close: closeUpdate }] = useDisclosure(false);
    const [carToUpdate, setCarToUpdate] = React.useState<ICar>();
    const announcements = useAnnouncementsStore(state => state.announcements);
    const { t } = useTranslation();
    const handleEdit = (car: ICar) => {
        const carData = data?.find(({ id }) => id === car.id);
        setCarToUpdate(carData);
        openUpdate();
    };
    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
        const current = useAnnouncementsStore.getState().announcements;
        useAnnouncementsStore.getState().setAnnouncements(current.filter(car => car.id !== id));
    };

    useEffect(() => {
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
                <Button onClick={openCreate}>{t('create_announcement')}</Button>
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
                opened={createOpened}
                onClose={closeCreate}
                title={t('create_car_announcement')}
                size="lg"
                centered
                styles={{
                    inner: { left: 0 }
                }}
            >
                create
                {/*<CreateCarAnnouncement*/}
                {/*    close={closeCreate}*/}
                {/*    {...modalProps}*/}
                {/*/>*/}
            </Modal>

            <Modal
                opened={updateOpened}
                onClose={closeUpdate}
                title={t('update_car_announcement')}
                size="lg"
                centered
                styles={{
                    inner: { left: 0 }
                }}
            >
                {
                    // @ts-ignore
                    carToUpdate?.id && <UpdateCarAnnouncement
                        close={closeUpdate}
                        carId={carToUpdate.id}
                        {...modalProps}
                    />
                }
            </Modal>
        </>
    )
}

export default AnnouncementsPage;