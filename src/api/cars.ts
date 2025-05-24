import apiClient from './apiClient';
import { showNotification } from '@mantine/notifications';
import type { ICar } from '../types/general';

// interface CarResponse {
//     data: ICar,
// }

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