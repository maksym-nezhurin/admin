import { TextInput, NumberInput, Select, Button, Stack, Card, Group, Text, Badge, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { carsService } from '../services/cars';
import { useQuery } from '@tanstack/react-query';
import type { ICar } from '../types/general';
import type { ICarModel } from '../types/car';
import { useAnnouncementsStore } from '../store/uiStore';

// Utility for country flag emoji
const countryNameToCode: Record<string, string> = {
  'Ukraine': 'UA',
  'United States': 'US',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Japan': 'JP',
  'United Kingdom': 'GB',
  'China': 'CN',
  'South Korea': 'KR',
  'Spain': 'ES',
  'Czech Republic': 'CZ',
  'Poland': 'PL',
  'Sweden': 'SE',
  'India': 'IN',
  // ...додай інші потрібні країни
};
const getFlagEmoji = (country: string) => {
  if (!country) return '';
  let code = country;
  if (country.length > 2) {
    code = countryNameToCode[country] || '';
  }
  if (code.length === 2) {
    return code
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
  }
  return '';
};

const CarDetailsCard = ({ variant, selectedVariant, onSelect }: { variant: ICarModel, selectedVariant: string, onSelect: (id: string) => void }) => {
  const isSelected = selectedVariant === (variant.value || variant.id);

  return (
    <Card
      shadow={isSelected ? "md" : "sm"}
      padding="lg"
      radius="lg"
      withBorder
      style={{
        minWidth: 280,
        marginBottom: 8,
        cursor: 'pointer',
        background: isSelected ? 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)' : '#fff',
        transition: 'all 0.2s',
      }}
      onClick={() => onSelect(variant.value || variant.id)}
    >
      <Group position="apart" mb="xs">
        <Text weight={700} size="md" color={isSelected ? 'blue' : 'dark'}>
          {variant.label || variant.model}
        </Text>
        <Group spacing={8} align="center">
          <Badge color={ isSelected ? 'blue' : 'dark' } variant="filled">
             {variant.model || '-'}
          </Badge>
        </Group>
      </Group>
      <Divider my="xs" />
      <Group position="apart" mb="xs">
        <Text weight="bold">Description:</Text>
        <Text size="md" mb={4}>
          {variant.value || '-'}
        </Text>
      </Group>
      <Divider my="xs" />
      <Group spacing={8} mb={4}>
        <Badge color="blue" variant="dot"><b>Engine:</b> {variant.engine || '-'}</Badge>
        <Badge color="blue" variant="dot"><b>Weight:</b> {variant.weight || '-'}</Badge>
      </Group>      
      <Group spacing={8}>
        <Text size="sm"><b>Transmission:</b> {variant.transmission || '-'}</Text>
        <Text size="sm"><b>Country:</b> {variant.country || '-'}</Text>
        <Text size="lg" style={{ lineHeight: 1 }}>{getFlagEmoji(variant.country)}</Text>
      </Group>
    </Card>
  );
};

export function CreateCarAnnouncement(props: { close?: () => void }) {
  const { close } = props;
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');

  // Generate years for select (e.g. 1990-2025)
  const years = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => {
    const y = (1990 + i).toString();
    return { value: y, label: y };
  }).reverse();

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['brands', selectedYear],
    queryFn: () => carsService.getBrandsByYear(selectedYear),
    enabled: !!selectedYear,
  });

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['models', selectedBrand, selectedYear],
    queryFn: () => (selectedBrand && selectedYear) ? carsService.getModelsByBrandAndYear(selectedBrand, selectedYear) : Promise.resolve([]),
    enabled: !!selectedBrand && !!selectedYear,
  });

  const { data: variants = [], isLoading: variantsLoading } = useQuery({
    queryKey: ['variants', selectedModel],
    queryFn: () => selectedModel ? carsService.getVariantsByModelAndYear(selectedModel, selectedYear) : Promise.resolve([]),
    enabled: !!selectedModel,
  });

  // Reset brand/model when year changes
  useEffect(() => {
    setSelectedBrand('');
    setSelectedModel('');
  }, [selectedYear]);

  useEffect(() => {
    setSelectedModel('');
  }, [selectedBrand]);

  const form = useForm<Omit<ICar, 'id' | 'ownerId'>>({
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
    },
    validate: {
      brand: (value: string) => (value.length < 2 ? 'Brand must have at least 2 letters' : null),
      model: (value: string) => (value.length < 2 ? 'Model must have at least 2 letters' : null),
      engine: (value: number) => (value < 1 ? 'Engine is required' : null),
      price: (value: number) => (value <= 0 ? 'Price must be greater than 0' : null),
      year: (value: number) => (value < 1900 || value > new Date().getFullYear() ? 'Invalid year' : null),
      mileage: (value: string | number) => (value < '0' ? 'Mileage cannot be negative' : null),
      description: (value: string) => (value.length < 10 ? 'Description must have at least 10 characters' : null),
    },
  });

  const addAnnouncement = useAnnouncementsStore(state => state.addAnnouncement);

  const handleSubmit = async (values: Omit<ICar, 'id' | 'ownerId'>) => {
    try {
      const newAnnouncement = await carsService.createCar(values);
      addAnnouncement(newAnnouncement);
      form.reset();
      setSelectedVariant('');
      if ( typeof close === 'function') {
         close();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedVariant && variants.length > 0) {
      const found = variants.find(
        (v: ICarModel) => (v.value || v.id) === selectedVariant
      );
      if (found && found.engine) {
        form.setFieldValue('engine', Number(found.engine));
      }
    }
  }, [selectedVariant, variants]);

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
      
        handleSubmit({
          ...form.values,
          brand: selectedBrand,
          complectation: selectedVariant,
          model: selectedModel,
          year: Number(selectedYear),
        });
      }}>
        <Stack>
          <Select
            required
            name='year'
            label="Year"
            placeholder="Select year"
            data={years}
            value={selectedYear}
            onChange={val => setSelectedYear(val || '')}
          />
          <Select
            required
            label="Brand"
            name='brand'
            placeholder="Select brand"
            data={brands}
            value={selectedBrand}
            onChange={val => {
              setSelectedBrand(val || '');
              setSelectedModel('');
              form.setFieldValue('model', '');
              form.setFieldValue('complectation', '');
            }}
            disabled={brandsLoading || !selectedYear}
          />
          <Select
            required
            label="Model"
            name='model'
            placeholder="Choose model"
            data={models}
            value={selectedModel}
            onChange={val => {
              setSelectedModel(val || '');
              form.setFieldValue('model', val || '');
            }}
            disabled={!selectedBrand || modelsLoading}
          />
          {
            variants.length === 0 && <Text align="center" color="red" size="sm">No variants found for this model.</Text>
          }
          {modelsLoading || variantsLoading ? <div> Loading... </div>  : (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 16,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 8,
              scrollbarWidth: 'thin',
              scrollbarColor: '#228be6 #e0e7ff',
              WebkitOverflowScrolling: 'touch',
            }}>
              {variants.map((variant) => (
                <CarDetailsCard key={variant.id} variant={variant} selectedVariant={selectedVariant} onSelect={setSelectedVariant} />
              ))}
            </div>
          )}
          <Select
            required
            label="Type"
            name='type'
            placeholder="Select car type"
            data={[
              { value: 'sedan', label: 'Sedan' },
              { value: 'hatchback', label: 'Hatchback' },
              { value: 'suv', label: 'SUV' },
              { value: 'coupe', label: 'Coupe' },
            ]}
            {...form.getInputProps('type')}
          />
          <TextInput
            required
            label="Engine"
            name='engine'
            disabled={!!selectedVariant}
            placeholder="Engine size"
            {...form.getInputProps('engine')}
          />
          <NumberInput
            required
            label="Price"
            name='price'
            placeholder="Price in USD"
            min={0}
            {...form.getInputProps('price')}
          />
          <NumberInput
            required
            label="Mileage"
            name='mileage'
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
           <TextInput
            label="Color"
            placeholder="Car color"
            {...form.getInputProps('color')}
          />
          <Button type="submit" fullWidth mt="xl">
            Create Announcement
          </Button>
        </Stack>
      </form>
    </div>
  );
}