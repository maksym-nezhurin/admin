import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsService } from '../services/cars';
import { CAR_TYPE_OPTIONS } from '../types/constants';
import { useTranslation } from 'react-i18next';
import { TextInput, NumberInput, Select, Button, Stack, Textarea, Switch } from '@mantine/core';
import { useEffect, useRef } from 'react';
import type { ICarAnnoncement, ICarFormModel } from '../types/car';

type IProps = ICarAnnoncement & { carId: string };

export function UpdateCarAnnouncement(props: IProps) {
  const {
    carId,
    close,
    selectedYear,
    setSelectedYear,
    selectedBrand,
    setSelectedBrand,
    selectedModel,
    setSelectedModel,
    brands,
    brandsLoading,
    models,
    modelsLoading,
  } = props;
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const originalValues = useRef<ICarFormModel | null>(null);
  
  // Получение данных автомобиля
  const { data: carData, isLoading } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => carsService.getCar(carId),
    enabled: !!carId,
  });

  // Инициализация формы
  const form = useForm<ICarFormModel>({
    initialValues: {
      brand: '',
      model: '',
      type: 'sedan',
      engine: 1,
      price: 0,
      complectation: '',
      year: new Date().getFullYear(),
      mileage: 0,
      description: '',
      color: '',
      isRentable: false,
      rentPricePerDay: 0,
    },
     validate: {
      brand: (value: string) => (value.length < 2 ? t('brand_min_length', { count: 2 }) : null),
      model: (value: string) => (value.length < 2 ? t('model_min_length', { count: 2 }) : null),
      engine: (value: number) => (value < 1 ? t('engine_required') : null),
      price: (value: number) => (value <= 0 ? t('price_min') : null),
      year: (value: number) => (value < 1900 || value > new Date().getFullYear() ? t('invalid_year') : null),
      mileage: (value: string | number) => (value < '0' ? t('mileage_negative') : null),
      description: (value: string) => (value.length < 10 ? t('description_min_length', { count: 10 }) : null),
      rentPricePerDay: (value, values) => values.isRentable && (!value || value <= 0) ? 'Enter valid daily rental price': null,
    },
  });

  // Function to get only changed values
  function getChangedValues<T extends Record<string, any>>(
    currentValues: T,
    originalValues?: Partial<T> | undefined
  ): Partial<T> {
    if (!originalValues) return currentValues;

    const changes: Partial<T> = {};

    (Object.keys(currentValues) as (keyof T)[]).forEach((key) => {
      const currentValue = currentValues[key];
      const originalValue = originalValues[key];
      
      if (
        (typeof currentValue === 'number' && typeof originalValue === 'number' && currentValue !== originalValue) ||
        (typeof currentValue === 'boolean' && typeof originalValue === 'boolean' && currentValue !== originalValue) ||
        (typeof currentValue === 'string' && typeof originalValue === 'string' && currentValue.trim() !== originalValue.trim()) ||
        currentValue !== originalValue
      ) {
        changes[key] = currentValue;
      }
    });

    return changes;
  }


  // Check if there are any changes
  const hasChanges = (): boolean => {
    if (!originalValues.current) return false;

    const changes = getChangedValues<ICarFormModel>(
      form.values,
      originalValues.current
    );

    return Object.keys(changes).length > 0;
  };

  useEffect(() => {
    if (carData) {
      // Store original values for comparison
      originalValues.current = { ...carData };
      
      form.setValues(carData);

      if (carData.year) {
        setSelectedYear(carData.year);
        setSelectedBrand(carData.brand.toLowerCase());
        setSelectedModel(carData.model);
      }
    }
  }, [carData]);

  const mutation = useMutation({
    mutationFn: (updatedCar: Partial<ICarFormModel>) => carsService.updateCar(carId, updatedCar),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['car', carId], updatedData);
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      if (close) close();
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const handleSubmit = (values: Partial<ICarFormModel>) => {
    const changedValues = getChangedValues(values, originalValues.current ?? {});
    
    // Only send changed values if there are any changes
    if (Object.keys(changedValues).length > 0) {
      mutation.mutate(changedValues);
    } else {
      console.log('No changes detected, skipping update');
      if (close) close();
    }
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <form onSubmit={form.onSubmit((vals) => handleSubmit(vals))}>
      <Stack>
        <Select
          required
          label={t('brand')}
          name='brand'
          placeholder={t('select_brand')}
          data={brands}
          value={selectedBrand}
          onChange={val => {
            form.setFieldValue('brand', val || '');
            setSelectedBrand(val || '');
            setSelectedModel('');
            form.setFieldValue('model', '');
            form.setFieldValue('complectation', '');
          }}
          disabled={brandsLoading || !selectedYear}
        />
        
        <Select
          required
          label={t('model')}
          name='model'
          placeholder={t('choose_model')}
          data={models}
          value={selectedModel}
          onChange={val => {
            setSelectedModel(val || '');
            form.setFieldValue('model', val || '');
          }}
          disabled={!selectedBrand || modelsLoading}
        />

        <Select
          label="Тип"
          data={CAR_TYPE_OPTIONS}
          {...form.getInputProps('type')}
          required
        />
        
        <NumberInput 
          label="Объем двигателя" 
          {...form.getInputProps('engine')} 
          required 
        />
        
        <NumberInput 
          label="Цена" 
          {...form.getInputProps('price')} 
          required 
        />
        
        <NumberInput 
          label="Год выпуска" 
          {...form.getInputProps('year')} 
          required 
        />
        
        <NumberInput 
          label="Пробег" 
          {...form.getInputProps('mileage')} 
          required 
        />
        
        <Textarea 
          label="Описание" 
          {...form.getInputProps('description')} 
          required 
        />
        
        <TextInput 
          label="Цвет" 
          {...form.getInputProps('color')} 
        />
        
        <Switch 
          label="Доступен для аренды" 
          {...form.getInputProps('isRentable', { type: 'checkbox' })} 
        />
        
        {form.values.isRentable && (
          <NumberInput 
            label="Цена аренды в день" 
            {...form.getInputProps('rentPricePerDay')} 
            required 
          />
        )}
        
        <Button 
          type="submit" 
          disabled={!hasChanges()}
          loading={mutation.isPending}
        >
          {hasChanges() ? 'Сохранить изменения' : 'Нет изменений'}
        </Button>
      </Stack>
    </form>
  );
}