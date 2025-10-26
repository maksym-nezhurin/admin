import apiClient from '../api/apiClient';
import { showNotification } from '@mantine/notifications';
import { ROUTES } from './constant';
import type { ICar, ICarFormModel, ICarAttributes, IAnnouncementCarFormData, IAnnouncementCar } from '../types/car';
// import type {
//     ICarModel,
//     IBrand,
//     IModel,
//     IVariant
//  } from '../types/car';

interface NotifyCarParams {
  carId: string;
  ownerId: string;
}

export const carsService = {
    async getCars(): Promise<ICar[]> {
        const response = await apiClient.get(`${ROUTES.CARS}/my`, {
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

    async getCarAttributes(): Promise<ICarAttributes[]> {
        const response = await apiClient.get(`${ROUTES.CARS}/attributes`, {
            withCredentials: true,
        });

        if (!response.data.data) {
            showNotification({
                title: 'Error',
                message: 'Failed to fetch car attributes',
                color: 'red',
            });
            throw new Error('Failed to fetch car attributes');
        }

        return response.data.data;
    },

    async getAllCars(): Promise<ICar[]> {
        const response = await apiClient.get(`${ROUTES.CARS}`, {
            withCredentials: true,
        });
        return response.data.data;
    },

    async getCar(id: string): Promise<ICar> {
        const response = await apiClient.get(`${ROUTES.CARS}/${id}`);
        return response.data.data;
    },

    async createCar(car: IAnnouncementCarFormData): Promise<IAnnouncementCar> {
        const formData = new FormData();
        console.log('Creating car with data:', car);
        formData.append('attributes', JSON.stringify(car.attributes));

        Object.entries(car).forEach(([key, value]) => {
            if (key !== 'images' && key !== 'attributes') {
                formData.append(key, value as string);
            }
        });

        if (car.images && Array.isArray(car.images)) {
            (car.images as unknown as File[]).forEach((file) => {
                formData.append('images', file);
            });
        }

        const response = await apiClient.post(`${ROUTES.CARS}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Create car response:', response);

        if (response.status === 201) {
            showNotification({
                title: 'Success',
                message: `Car ${car.model} created successfully`,
                color: 'green',
            });
        } else {
            showNotification({
                title: 'Error',
                message: `Failed to create car ${car.model}`,
                color: 'red',
            });
            throw new Error(`Failed to create car ${car.model}`);
        }
        return response.data.data;
    },

    async updateCar(carId: string, car: Partial<ICarFormModel>): Promise<ICar> {
      const formData = new FormData();

      Object.entries(car).forEach(([key, value]) => {
          if (key !== 'images') {
              formData.append(key, value as string);
          }
      });
      const response = await apiClient.patch(`${ROUTES.CARS}/${carId}`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });

      if (response.data.success) {
        showNotification({
            title: 'Success',
            message: `Car ${car.model} updated successful!`,
            color: 'green',
        });
      } else {
        showNotification({
            title: 'Error',
            message: `Failed to update car ${car.model}`,
            color: 'red',
        });
        throw new Error(`Failed to update car ${car.model}`);
      }
      return response.data.data;
    },

    async deleteCar(carId: string): Promise<void> {
      const response = await apiClient.delete(`${ROUTES.CARS}/${carId}`);

       if (response.data.success) {
        showNotification({
            title: 'Success',
            message: `Car ${carId} deleted successful!`,
            color: 'green',
        });
      } else {
        showNotification({
            title: 'Error',
            message: `Failed to deleted car ${carId}`,
            color: 'red',
        });
        throw new Error(`Failed to delete car ${carId}`);
      }
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
    },

//     async getBrands(): Promise<{ value: string; label: string }[]> {
//         const response = await apiClient.get('/cars/characteristics/brands');
//         return (response.data.data || response.data).map((b: IBrand) => ({
//             value: b.make_id,
//             label: b.make_display,
//         }));
//     },

//   async getModels(brandId: string): Promise<{ value: string; label: string }[]> {
//     const response = await apiClient.get(`/cars/characteristics/brands/${brandId}/models`);
//     return (response.data.data || response.data).map((m: IModel) => ({
//       value: m.model_make_id,
//       label: m.model_name,
//     }));
//   },

//   async getVariants(modelId: string): Promise<{ value: string; label: string }[]> {
//     const response = await apiClient.get(`/cars/characteristics/models/${modelId}/variants`);
//     return (response.data.data || response.data).map((v: IVariant) => ({
//       value: v.model_id,
//       label: v.model_name,
//     }));
//   },

  /**
   * Get car brands (makes) for a specific year
   */
//   async getBrandsByYear(year: string | number): Promise<{ value: string; label: string }[]> {
//     const response = await apiClient.get(`/cars/characteristics/brands/by-year/${year}`);
//     // CarQuery API returns { Makes: [...] }
//     const makes = response.data.Makes || response.data.makes || response.data.data || response.data;
//     return makes.map((b: IBrand) => ({
//       value: b.make_id,
//       label: b.make_display,
//     }));
//   },

//   /**
//    * Get car models for a specific brand and year
//    */
//   async getModelsByBrandAndYear(brandId: string, year: string | number): Promise<{ value: string; label: string }[]> {
//     const response = await apiClient.get(`/cars/characteristics/brands/${brandId}/models/by-year/${year}`);
//     const models = response.data.data;

//     return models.map((m: IModel) => ({
//       value: m.model_name,
//       label: m.model_name,
//     }));
//   },

//   async getVariantsByModelAndYear(modelId: string, year: string | number): Promise<ICarModel[]> {
//     const response = await apiClient.get(`/cars/characteristics/models/${modelId}/variants/by-year/${year}`);

//     const variants = response.data.Variants || response.data.variants || response.data.data || response.data;
//     return variants.map((v: IVariant) => ({
//       id: v.model_id,
//       value: v.model_trim,
//       engine: v.model_engine_cc,
//       label: v.model_make_display,
//       weight: v.model_weight_kg,
//       transmission: v.model_transmission_type,
//       model: v.model_name,
//       country: v.make_country,
//     }));
//   }
}