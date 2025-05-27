import { TextInput, NumberInput, Select, Button, Stack, Card, Group, Text, Badge, Divider, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { carsService } from '../services/cars';
import { useQuery } from '@tanstack/react-query';
import type { ICar } from '../types/general';
import type { ICarModel } from '../types/car';
import { useAnnouncementsStore } from '../store/uiStore';
import { CAR_TYPE_OPTIONS, countryNameToCode } from '../types/constants';
import { useTranslation } from 'react-i18next';

// Utility for country flag emoji
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
  const { t } = useTranslation();
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
      brand: (value: string) => (value.length < 2 ? t('brand_min_length', { count: 2 }) : null),
      model: (value: string) => (value.length < 2 ? t('model_min_length', { count: 2 }) : null),
      engine: (value: number) => (value < 1 ? t('engine_required') : null),
      price: (value: number) => (value <= 0 ? t('price_min') : null),
      year: (value: number) => (value < 1900 || value > new Date().getFullYear() ? t('invalid_year') : null),
      mileage: (value: string | number) => (value < '0' ? t('mileage_negative') : null),
      description: (value: string) => (value.length < 10 ? t('description_min_length', { count: 10 }) : null),
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
            label={t('year')}
            placeholder={t('select_year')}
            data={years}
            value={selectedYear}
            onChange={val => setSelectedYear(val || '')}
          />
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
          {
            variants.length === 0 && <Text align="center" color="red" size="sm">{t('no_variants_found')}</Text>
          }
          {modelsLoading || variantsLoading ? <div>{t('loading')}</div>  : (
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
            label={t('type')}
            name='type'
            placeholder={t('select_car_type')}
            data={CAR_TYPE_OPTIONS}
            {...form.getInputProps('type')}
          />
          <TextInput
            required
            label={t('engine')}
            name='engine'
            disabled={!!selectedVariant}
            placeholder={t('engine_size')}
            {...form.getInputProps('engine')}
          />
          <NumberInput
            required
            label={t('price')}
            name='price'
            placeholder={t('price_usd')}
            min={0}
            {...form.getInputProps('price')}
          />
          <NumberInput
            required
            label={t('mileage')}
            name='mileage'
            placeholder={t('mileage_km')}
            min={0}
            {...form.getInputProps('mileage')}
          />
          <Textarea
            required
            label={t('description')}
            placeholder={t('car_description')}
            autosize
            minRows={3}
            {...form.getInputProps('description')}
          />
          <TextInput
            label={t('color')}
            placeholder={t('car_color')}
            {...form.getInputProps('color')}
          />
          <Button type="submit" fullWidth mt="xl">
            {t('create_announcement')}
          </Button>
        </Stack>
      </form>
    </div>
  );
}