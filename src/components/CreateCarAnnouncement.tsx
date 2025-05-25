import { TextInput, NumberInput, Select, Button, Title, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { carsService } from '../services/cars';
import type { ICar } from '../types/general';

export function CreateCarAnnouncement() {
  const form = useForm<Omit<ICar, '_id' | 'ownerId'>>({
    initialValues: {
      model: '',
      type: '',
      engine: 1,
      complectation: '',
      price: 0,
      year: new Date().getFullYear(),
      mileage: 0,
      description: '',
    },
    validate: {
      model: (value: string) => (value.length < 2 ? 'Model must have at least 2 letters' : null),
      type: (value: string) => (value.length < 2 ? 'Type must have at least 2 letters' : null),
      engine: (value: number) => (value <= 0 ? 'Engine is required' : null),
      price: (value: number) => (value <= 0 ? 'Price must be greater than 0' : null),
      year: (value: number) => (value < 1900 || value > new Date().getFullYear() ? 'Invalid year' : null),
      mileage: (value: string | number) => (Number(value) < 0 ? 'Mileage cannot be negative' : null),
      complectation: (value: string) => (value.length < 2 ? 'Complectation must have at least 2 letters' : null),
      description: (value: string) => (value.length < 10 ? 'Description must have at least 10 characters' : null),
    },
  });

  const handleSubmit = async (values: Omit<ICar, '_id' | 'ownerId'>) => {
    try {
      await carsService.createCar(values);

      form.reset();
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <div>
      <Title order={2} mb="md">Create Car Announcement</Title>
      <form onSubmit={form.onSubmit(async (values) => { await handleSubmit(values); })}>
        <Stack>
          <TextInput
            required
            label="Model"
            placeholder="Car model"
            {...form.getInputProps('model')}
          />
          <TextInput
            required
            label="Type"
            placeholder="Car type"
            {...form.getInputProps('type')}
          />
          <TextInput
            required
            label="Engine"
            placeholder="Engine size"
            {...form.getInputProps('engine')}
          />
          <Select
            required
            label="Complectation"
            placeholder="Select complectation"
            data={[
              { value: 'basic', label: 'Basic' },
              { value: 'premium', label: 'Premium' },
              { value: 'luxury', label: 'Luxury' },
            ]}
            {...form.getInputProps('complectation')}
          />
          <NumberInput
            required
            label="Price"
            placeholder="Price in USD"
            min={0}
            {...form.getInputProps('price')}
          />
          <NumberInput
            required
            label="Year"
            placeholder="Manufacturing year"
            min={1900}
            max={new Date().getFullYear()}
            {...form.getInputProps('year')}
          />
          <NumberInput
            required
            label="Mileage"
            placeholder="Mileage in km"
            min={0}
            {...form.getInputProps('mileage')}
          />
          <TextInput
            required
            label="Description"
            placeholder="Car description"
            {...form.getInputProps('description')}
          />
          <Button type="submit" fullWidth mt="xl">
            Create Announcement
          </Button>
        </Stack>
      </form>
    </div>
  );
}