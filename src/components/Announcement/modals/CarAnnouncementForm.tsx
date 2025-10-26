import React, { forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { useForm } from '@mantine/form';
import { FilePicker } from '../../FilePicker';
import { Stack, Button, Group, Select, TextInput, NumberInput, Textarea, ColorPicker } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CarVariantCard } from '../CarVariantCard';
import {
    CONDITION_OPTIONS,
    CAR_TYPE_OPTIONS,
    TRANSMISSION_OPTIONS,
    FUEL_TYPE_OPTIONS,
    DRIVE_OPTIONS
} from '../../../types/constants';

export interface CarAnnouncementFormProps {
  initialValues?: Partial<ICarFormModel>;
  onSubmit: (values: ICarFormModel) => void;
  loading?: boolean;
  mode?: 'create' | 'update';
  brands?: string[];
  models?: string[];
}

export const CarAnnouncementForm = forwardRef(({
  initialValues = {},
  onSubmit,
  loading = false,
  mode = 'create',
  brands = [],
  models = [],
  variants = [],
  years = [],
  attributes = [],
  selectedYear = '2021',
  setSelectedYear,
  selectedBrand,
  setSelectedBrand,
  selectedModel,
  setSelectedModel,
//   selectedVariant,
//   setSelectedVariant,
}: CarAnnouncementFormProps, ref) => {
    const form = useForm<ICarFormModel>({
        initialValues: {
            brand: 'mercedes',
            model: 'gclass',
            type: 'sedan',
            complectation: '',
            description: '',
            ...initialValues,
            engineVolume: initialValues.engineVolume ? Number(initialValues.engineVolume) : 1,
            mileage: initialValues.mileage ? Number(initialValues.mileage) : 0,
            price: initialValues.price ? Number(initialValues.price) : 0,
            year: initialValues.year ? parseInt(selectedYear || initialValues.year, 10) : new Date().getFullYear(),
        },
        validate: {
            brand: (value: string) => (value.length < 2 ? t('brand_min_length', { count: 2 }) : null),
            model: (value: string) => (value.length < 2 ? t('model_min_length', { count: 2 }) : null),
            engine: (value: number) => (value < 1 ? t('engine_required') : null),
            price: (value: number) => (value <= 0 ? t('price_min') : null),
            year: (value: number) => (value < 1900 || value > new Date().getFullYear() ? t('invalid_year') : null),
            mileage: (value: string | number) => (value < '0' ? t('mileage_negative') : null),
            description: (value: string) => (value.length < 10 ? t('description_min_length', { count: 10 }) : null),
            images: (value) => (value?.length === 0 ? 'At least one image is required' : null),
            // add other validations
        },
    });
    // console.log('Form values:', form.values);
    const { t } = useTranslation();
    const [selectedVariant, setSelectedVariant] = useState('');
    // console.log('Variants in variants:', variants);

    // Expose form instance to parent via ref
    useImperativeHandle(ref, () => form);

    const onSelectVariant = (variant: string) => {
        setSelectedVariant(variant);
        const varintData = variants.find(v => v.id === variant);
        console.log('Selected variant:', varintData, form.values);
        const selectedEngineFuel = ['Petrol', 'Gasoline'].includes(varintData?.engineFuel) ? 'Petrol' : varintData?.engineFuel;
        const selectedTransmission = TRANSMISSION_OPTIONS.find(opt => opt.label === varintData?.transmissionType);
        const selectedFuelType = FUEL_TYPE_OPTIONS.find(opt => opt.label === selectedEngineFuel);
        const engineVolume = varintData?.engineCc ? Number(varintData.engineCc) : form.values.engineVolume;
        const driveType = CAR_TYPE_OPTIONS.find(opt => opt.label === varintData?.body);
        console.log('Selected driveType:', CAR_TYPE_OPTIONS, varintData?.body, driveType);
        // form.setFieldValue('bodyType', variant.body);
        // form.setFieldValue('drive', variant.drive);
        engineVolume && form.setFieldValue('engineVolume', engineVolume);
        selectedTransmission && form.setFieldValue('transmission', selectedTransmission.value);
        form.setFieldValue('bodyType', driveType?.value || '');
        selectedFuelType && form.setFieldValue('fuelType', selectedFuelType.value);
    }

    useEffect(() => {
        console.log('year updated!');
        const { year } = form.values;
        if (year) {
            setSelectedYear(parseInt(year, 10));
        }
        
    }, [form.values])

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack>
                <Select
                    required
                    name='year'
                    label={t('year')}
                    placeholder={t('select_year')}
                    data={years}
                    value={selectedYear.toString()}
                    onChange={(val) => {
                        form.setFieldValue('year', val);
                    }}
                    // onChange={(val) => val && setSelectedYear(parseInt(val, 10))}
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
                    disabled={!selectedBrand}
                />

                {/* {
                    variants.length === 0 && <Text align="center" color="red" size="sm">{t('no_variants_found')}</Text>
                } */}
                {variants.length && (
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
                            <CarVariantCard key={variant.value} variant={variant} selectedVariant={selectedVariant} onSelect={onSelectVariant} />
                        ))}
                    </div>
                )}

                {
                    attributes.map(attr => {
                        // console.log('Rendering number input for attribute:', attr);
                    if (attr.type.toLowerCase() === 'number') {
                        return (
                            <NumberInput
                                key={attr.id}
                                required
                                label={attr.name + (attr.unit ? ` (${attr.unit})` : '')}
                                name={attr.key}
                                placeholder={t(`enter_${attr.name.toLowerCase()}`)}
                                min={0}
                                {...form.getInputProps(attr.key as keyof ICarFormModel)}
                            />
                        );
                    }
                    if (attr.type.toLowerCase() === 'string') {
                        return (
                            <TextInput
                                key={attr.id}
                                required
                                label={attr.name + (attr.unit ? ` (${attr.unit})` : '')}
                                name={attr.key}
                                placeholder={t(`${attr.name.toLowerCase()}`)}
                                {...form.getInputProps(attr.key as keyof ICarFormModel)}
                            />
                        );
                    }
                    if (attr.type.toLowerCase() === 'enum') {
                        return (
                            <Select
                                key={attr.id}
                                required={attr.required || false}
                                label={attr.name + (attr.unit ? ` (${attr.unit})` : '')}
                                name={attr.key}
                                placeholder={t(`select_${attr.name.toLowerCase()}`)}
                                data={attr.options?.map(a => ({ value: a.id, label: a.value })) || []}
                                {...form.getInputProps(attr.key as keyof ICarFormModel)}
                            />  
                        );
                    }
                    // Add more types as needed
                    return null;
                    })
                }

                <NumberInput
                    required
                    label={t('price')}
                    name='price'
                    placeholder={t('price_usd')}
                    min={0}
                    {...form.getInputProps('price')}
                />

                <Textarea
                    required
                    label={t('description')}
                    placeholder={t('car_description')}
                    autosize
                    minRows={3}
                    {...form.getInputProps('description')}
                />
                
                {
                    mode === 'create' && (
                        <FilePicker
                            value={(form.values.images ?? []).filter((img): img is File => img instanceof File)}
                            onDrop={(files: File[]) => form.setFieldValue('images', files)}
                        />
                    )
                }

                {/* <Switch
                    label={t('allow_rental')}
                    {...form.getInputProps('isRentable', { type: 'checkbox' })}
                /> */}

                {/* <ColorPicker
                    format="hex"
                    size='lg'
                    withPicker={false}
                    swatches={['#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']} 
                    label={t('color')}
                    placeholder={t('car_color')}
                    {...form.getInputProps('color')}
                />
                <TextInput
                    label={t('color')}
                    placeholder={t('car_color')}
                    value={form.values.color}
                    disabled={true}
                /> */}

                {/* Add more fields as needed */}
                <Group mt="md">
                    <Button type="submit" loading={loading}>
                    {mode === 'create' ? t('create_announcement') : 'Update Announcement'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
});