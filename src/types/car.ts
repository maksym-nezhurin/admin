export interface ICarModel {
  id: string;
  makeId: string;
  makeDisplay: string;
  makeCountry: string;
  name: string; // model name
  trim: string;
  year: string;
  body?: string;
  co2?: string;
  doors?: string;
  drive?: string;
  engineBoreMm?: string;
  engineCc?: string;
  engineCompression?: string;
  engineCylinders?: string;
  engineFuel?: string;
  enginePosition?: string;
  enginePowerPs?: string;
  enginePowerRpm?: string;
  engineStrokeMm?: string;
  engineTorqueNm?: string;
  engineTorqueRpm?: string;
  engineType?: string;
  engineValvesPerCylinder?: string;
  fuelCapL?: string;
  heightMm?: string;
  lengthMm?: string;
  lkmCity?: string;
  lkmHwy?: string;
  lkmMixed?: string;
  seats?: string;
  soldInUs: boolean;
  topSpeedKph?: string;
  transmissionType?: string;
  weightKg?: string;
  wheelbaseMm?: string;
  widthMm?: string;
  zeroTo100Kph?: string;
}

export interface ICar {
  id: string,
  title: string,
  bodyType: string,
  description: string;
  ownerId: string,
  brand: string,
  complectation: string,
  engineVolume: number,
  transmission: string,
  drive: string,
  model: string,
  type: string,
  price: number,
  year: number,
  mileage: string | number,
  color?: string;
  createdAt?: string;
  media?: {
    adId: string;
    id: string;
    position: number;
    type: string;
    url: string;
  }[];
  isRentable?: boolean;
  rentPricePerDay?: number;
}

interface IMedia {
  id: string;
  url: string;
  type: string;
  position: number;
  adId: string;
}

export interface IAnnouncementAttributes {
  attributeId: string;
  value: string;
}

type Currency = 'USD' | 'EUR' | 'UAH';

interface IAnnouncementFormData<T> {
  title: string;
  description: string;
  price: number;
  currency?: Currency;
  attributes: T;
  images: File[];
}

export type IAnnouncementCarFormData = IAnnouncementFormData<IAnnouncementAttributes[]>;

interface IAnnouncement extends Omit<IAnnouncementFormData<never>, 'images' | 'attributes'> {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  media: IMedia[];
}

type BotyTypeOptions = 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'convertible' | 'wagon' | 'van' | 'pickup';
type TransmissionOptions = 'automatic' | 'manual' | 'cvt' | 'semi-automatic' | 'dual-clutch';
type FuelTypeOptions = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'hydrogen' | 'other';
type ConditionOptions = 'new' | 'used' | 'certified pre-owned' | 'damaged';

export interface ICarAttributes {
  brand: string;
  model: string;
  condition: ConditionOptions;
  engineVolume: number;
  bodyType: BotyTypeOptions;
  transmission: TransmissionOptions;
  fuelType: FuelTypeOptions;
  drive: string;
  type: string;
  year: number;
  mileage: string | number;
  color?: string;
}

export interface ICarAttribute {
  type: string;
  id: string;
  name: string;
  unit: string;
  key: string;
  required: boolean;
  options: {
    id: string;
    value: string;
  }[]
}

export interface IAnnouncementCar extends IAnnouncement, ICarAttributes {
}

export type ICarFormModel = Omit<ICar, 'id' | 'ownerId' | 'images' | 'year'> & {
  images?: (string | File)[];
  year: number;
}

export type IOption = {
  value: string,
  label: string,
};

export type CarVariant = {
  id: string;
  makeId: string;
  name: string; // model name, e.g. "Forte"
  trim: string;
  year: string;
};

export interface ICarAnnoncement {
  close?: () => void,
  selectedYear: number,
  setSelectedYear: (year: number) => void,
  selectedBrand: string,
  setSelectedBrand: (brand: string) => void,
  selectedModel: string,
  setSelectedModel: (model: string) => void,
  selectedVariant: string,
  setSelectedVariant: (variant: string) => void,
  years: IOption[],
  attributes : ICarAttribute[],
  brands: IOption[],
  brandsLoading: boolean,
  models: IOption[],
  modelsLoading: boolean,
  variants: ICarModel[],
  variantsLoading: boolean,
}

export interface IBrand {
  make_id: string;
  make_display: string;
  make_is_common: string;
  make_country: string;
}

export interface IModel {
  id: string;
  model_name: string;
  model_make_id: string;
}

export interface IVariant {
  make_country: string;
  make_display: string;
  model_0_to_100_kph: number | null;
  model_body: string;
  model_co2: number | null;
  model_doors: string;
  model_drive: string;
  model_engine_bore_mm: number | null;
  model_engine_cc: string;
  model_engine_compression: string;
  model_engine_cyl: string;
  model_engine_fuel: string;
  model_engine_position: string;
  model_engine_power_ps: string;
  model_engine_power_rpm: number | null;
  model_engine_stroke_mm: number | null;
  model_engine_torque_nm: string;
  model_engine_torque_rpm: number | null;
  model_engine_type: string;
  model_engine_valves_per_cyl: string;
  model_fuel_cap_l: string;
  model_height_mm: number | null;
  model_id: string;
  model_length_mm: number | null;
  model_lkm_city: string;
  model_lkm_hwy: string;
  model_lkm_mixed: string;
  model_make_display: string;
  model_make_id: string;
  model_name: string;
  model_seats: number | null;
  model_sold_in_us: string;
  model_top_speed_kph: number | null;
  model_transmission_type: string;
  model_trim: string;
  model_weight_kg: string;
  model_wheelbase_mm: number | null;
  model_width_mm: number | null;
  model_year: string;
}