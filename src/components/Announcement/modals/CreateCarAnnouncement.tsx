import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { carsService } from '../../../services/cars';
import { useAnnouncementsStore } from '../../../store/uiStore';
// import { countryNameToCode } from '../../../types/constants';
import { useTranslation } from 'react-i18next';
// import { FilePicker } from '../../FilePicker';
import { showNotification } from '@mantine/notifications';
import { CarAnnouncementForm } from './CarAnnouncementForm';
import type { ICarFormModel, ICarAnnoncement, ICarAttribute } from '../../../types/car'

const generateAttributeInitialValues = (values: {
  year: string;
  brand: string;
  model: string;
}, attributes: ICarAttribute[]) => {
  const initialValues = [
    {
      attributeId: '2f75371f-6be2-42d2-b081-38b8740c97bb',
      value: values.year.toString(),
    },
    {
      attributeId: '4a3ae1fa-c033-4359-adf0-cdf2c3cc5e3d',
      value: values.brand,
    },
    {
      attributeId: '45d212d5-aa2c-48b6-a9a8-97a917cc4685',
      value: values.model,
    },
  ]
    
  attributes.forEach((attr) => {
    initialValues.push({
      attributeId: attr.id,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      value: values[attr.name.toLowerCase()].toString(),
    });
  })

  return initialValues;
}

export function CreateCarAnnouncement(props: ICarAnnoncement) {
  const {
    close,
    selectedYear,
    setSelectedYear,
    selectedBrand = 'Mercedes',
    setSelectedBrand,
    selectedModel = 'G-Class',
    setSelectedModel,
    selectedVariant,
    setSelectedVariant,
    attributes,
    years,
    brands = [],
    // brandsLoading,
    models = [],
     // modelsLoading,
    variants,
  } = props;

  const formRef = useRef<never>(null);
  const { t } = useTranslation();
  const mutation = useMutation({
    // @ts-ignore
    mutationFn: (newCar: ICarFormModel) => carsService.createCar(newCar),
    onSuccess: (data) => {
      // @ts-ignore
      addAnnouncement(data);
      // @ts-ignore
      formRef?.current?.reset();
      setSelectedVariant('');
      showNotification({ title: t('success'), message: t('car_created_successfully'), color: 'green' });
      if (typeof close === 'function') {
        close();
      }
    },
    onError: (error) => {
      console.error(error);
      showNotification({ title: t('error'), message: t('car_creation_failed'), color: 'red' });
    },
  });

  // Reset brand/model when year changes
  useEffect(() => {
    setSelectedBrand('');
    setSelectedModel('');
  }, [selectedYear]);

  useEffect(() => {
    setSelectedModel('');
  }, [selectedBrand]);

  const addAnnouncement = useAnnouncementsStore(state => state.addAnnouncement);

  const handleSubmit = async () => {
    try {
      const form = formRef.current;
      // @ts-ignore
      if (!form.validate().hasErrors) {
        mutation.mutate({
          title: `Buy my ${selectedBrand} car, model ${selectedModel}`,
          complectation: selectedVariant,
          // @ts-ignore
          price: Number(form.values.price),
          // @ts-ignore
          description: form.values.description,
          // @ts-ignore
          images: form.values.images?.filter((img): img is File => img instanceof File) || [],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          attributes: generateAttributeInitialValues({
            year: selectedYear,
            brand: selectedBrand,
            model: selectedModel,
            // @ts-ignore
            ...form.values,
          }, attributes),
        });
      }  
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   const form = formRef.current;

  //   if (selectedVariant && variants.length > 0) {
  //     const found = variants.find(
  //       (v: ICarModel) => (v.value) === selectedVariant
  //     );

  //     if (found && found.engine) {
  //       form.setFieldValue('engine', Number(found.engine));
  //     }
  //   }
  // }, [selectedVariant, variants]);

  return (
    <CarAnnouncementForm
          onSubmit={handleSubmit}
          loading={mutation.isPending}
          mode="create"
          brands={brands}
          models={models}
          variants={variants}
          attributes={attributes}
          years={years}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          // @ts-ignore
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          ref={formRef}
      />
  );
}