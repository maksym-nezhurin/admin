import apiClient from '../api/apiClient';
import { showNotification } from '@mantine/notifications';
import type { ICar } from '../types/general';

interface NotifyCarParams {
  carId: string;
  ownerId: string;
}

export const carsService = {
    async getCars(): Promise<ICar[]> {
        const response = await apiClient.post('/cars', {
            withCredentials: true,
        });

        if (!response.data.data) {
            showNotification({
                title: 'Error',
                message: 'Failed to fetch cars',
                color: 'red',
            });
            throw new Error('Failed to fetch cars');
        } else {
            showNotification({
                title: 'Success',
                message: 'Cars fetched successfully',
                color: 'green',
            });
        }

        return response.data.data;
    },

     async getCar(id: string): Promise<ICar> {
        // const res = await apiClient.get(`/cars/${id}`);
        return {
            _id: id,
            model: 'Toyota',
            type: 'Sedan',
            engine: 2,
            complectation: 'Full',
            ownerId: '12345',
            price: 20000,
            year: 2020,
            mileage: 15000,
            description: 'A reliable car with great fuel efficiency.',
        };
    },

    async createCar(car: Omit<ICar, '_id' | 'ownerId'>): Promise<ICar> {
        // const response = await apiClient.post('/cars', car);
        // if (response.status === 201) {
        //     showNotification({
        //         title: 'Success',
        //         message: `Car ${car.model} created successfully`,
        //         color: 'green',
        //     });
        // } else {
        //     showNotification({
        //         title: 'Error',
        //         message: `Failed to create car ${car.model}`,
        //         color: 'red',
        //     });
        //     throw new Error(`Failed to create car ${car.model}`);
        // }
        // return response.data;
        return {
            _id: '122332321-1212-12-1',
            model: car.model,
            type: car.type,
            engine: car.engine,
            complectation: car.complectation,
            ownerId: '12345', // Placeholder ownerId, replace with actual data from the session or context
            price: car.price,
            year: car.year,
            mileage: car.mileage,
            description: 'A reliable car with great fuel efficiency.', // Placeholder description, replace with actual data from the
        };
    },

    async notifyCar({carId, ownerId}: NotifyCarParams): Promise<void> {
        const response = await apiClient.post('/notify/car', {
            carId,
            ownerId,
        });
        if (response.status === 200) {
            showNotification({
                title: 'Success',
                message: `Notification sent for ${carId}`,
                color: 'green',
            });
        }
        else {
            showNotification({
                title: 'Error',
                message: `Failed to send notification for ${carId}`,
                color: 'red',
            });
        }
        return response.data;
    }
}