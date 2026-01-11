import type { TSelectOption } from "../types/common";

export const SCRAPPING_SOURCES_ENUM = {
  AUTOBazar: 'autobazar',
  AUTORIA: 'autoria',
} as const;

export const SCRAPPING_MARKETS_ENUM = {
  SLOVAKIA: 'SK',
  UKRAINE: 'UA',
} as const;

export type SCRAPPING_MARKETS_ENUM = (typeof SCRAPPING_MARKETS_ENUM)[keyof typeof SCRAPPING_MARKETS_ENUM];

export const SCRAPPING_MARKETS = [
    { label: 'Slovakia', value: SCRAPPING_MARKETS_ENUM.SLOVAKIA },
    { label: 'Ukraine', value: SCRAPPING_MARKETS_ENUM.UKRAINE },
];

const SLOVAKIA_SOURCES = [
    { label: 'Auto bazar EU', value: SCRAPPING_SOURCES_ENUM.AUTOBazar },
];

const UKRAINE_SOURCES = [
    { label: 'Auto Ria UA', value: SCRAPPING_SOURCES_ENUM.AUTORIA },
];

export const GET_SCRAPPING_SOURCES_BY_MARKET = (permission: SCRAPPING_MARKETS_ENUM) => {
  switch (permission) {
    case SCRAPPING_MARKETS_ENUM.SLOVAKIA:
      return SLOVAKIA_SOURCES;
    case SCRAPPING_MARKETS_ENUM.UKRAINE:
      return UKRAINE_SOURCES;
    default:
      return [];
  }
};

export const SCRAPPING_SOURCES: TSelectOption[] = [
    { label: 'Autobazar EU (SK)', value: SCRAPPING_SOURCES_ENUM.AUTOBazar },
    { label: 'Autoria UA', value: SCRAPPING_SOURCES_ENUM.AUTORIA },
];

export const FUEL_TYPES: TSelectOption[] = [
  { value: "", label: "Будь-яке" },
  { value: 1, label: "Бензин" },
  { value: 2, label: "Дизель" },
  { value: 3, label: "Газ/Бензин" },
  { value: 4, label: "Газ propan-butan/Бензин" },
  { value: 8, label: "Газ Metan/Бензин" },
  { value: 5, label: "Гібрид" },
  { value: 10, label: "Plug-In Hybrid" },
  { value: 11, label: "MHEB" },
  { value: 6, label: "Електро" },
];

const REGION_UA: TSelectOption[] = [
    { value: 0, label: "Вся Україна" },

    { value: 10, label: "Київська область" },
    { value: 2, label: "Житомирська область" },
    { value: 8, label: "Сумська область" },
    { value: 6, label: "Чернігівська область" },

    { value: 1, label: "Вінницька область" },
    { value: 16, label: "Кіровоградська область" },
    { value: 20, label: "Полтавська область" },
    { value: 24, label: "Черкаська область" },

    { value: 18, label: "Волинська область" },
    { value: 22, label: "Закарпатська область" },
    { value: 15, label: "Івано-Франківська область" },
    { value: 5, label: "Львівська область" },
    { value: 9, label: "Рівненська область" },
    { value: 3, label: "Тернопільська область" },
    { value: 4, label: "Хмельницька область" },
    { value: 25, label: "Чернівецька область" },

    { value: 11, label: "Дніпропетровська область" },
    { value: 13, label: "Донецька область" },
    { value: 14, label: "Запорізька область" },
    { value: 7, label: "Харківська область" },

    { value: 19, label: "Миколаївська область" },
    { value: 12, label: "Одеська область" },
    { value: 23, label: "Херсонська область" }
];

export const AVAILABLE_FILTERS = {
  PRICE_FROM: 'price_from',
  PRICE_TO: 'price_to',
  MILEAGE_FROM: 'mileage_from',
  MILEAGE_TO: 'mileage_to',
  YEAR_FROM: 'year_from',
  YEAR_TO: 'year_to',
  FUEL_TYPE: 'fuel_type_ids',
  STATE_IDS: 'state_ids',
} as const;

export type AVAILABLE_FILTERS = (typeof AVAILABLE_FILTERS)[keyof typeof AVAILABLE_FILTERS];

export type Filters = {
  [AVAILABLE_FILTERS.PRICE_FROM]?: number;
  [AVAILABLE_FILTERS.PRICE_TO]?: number;
  [AVAILABLE_FILTERS.MILEAGE_FROM]?: number;
  [AVAILABLE_FILTERS.MILEAGE_TO]?: number;
  [AVAILABLE_FILTERS.YEAR_FROM]?: number;
  [AVAILABLE_FILTERS.YEAR_TO]?: number;
  [AVAILABLE_FILTERS.FUEL_TYPE]?: string[];
  [AVAILABLE_FILTERS.STATE_IDS]?: number[];
}

export const DEFAULT_FILTERS_VALUES: Filters = {
  [AVAILABLE_FILTERS.PRICE_FROM]: 12000,
  [AVAILABLE_FILTERS.PRICE_TO]: 14000,
  [AVAILABLE_FILTERS.MILEAGE_FROM]: 50000,
  [AVAILABLE_FILTERS.MILEAGE_TO]: 70000,
  [AVAILABLE_FILTERS.YEAR_FROM]: 2019,
  [AVAILABLE_FILTERS.YEAR_TO]: 2020,
  [AVAILABLE_FILTERS.FUEL_TYPE]: [String(FUEL_TYPES[0].value)],
};

export interface FilterConfig {
    type: "number" | "select" | "multiselect";
    name: AVAILABLE_FILTERS;
    label: string;
    placeholder: string | number;
    data?: TSelectOption[];
}

// Function to generate default filters config with translations
export const getDefaultFiltersConfig = (t: (key: string) => string): FilterConfig[] => [
  { type: 'number', name: AVAILABLE_FILTERS.PRICE_FROM, label: t('scrapper.price_from'), placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.PRICE_FROM] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.PRICE_TO, label: t('scrapper.price_to'), placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.PRICE_TO] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.MILEAGE_FROM, label: t('scrapper.mileage_from'), placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.MILEAGE_FROM] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.MILEAGE_TO, label: t('scrapper.mileage_to'), placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.MILEAGE_TO] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.YEAR_FROM, label: t('scrapper.year_from'), placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.YEAR_FROM] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.YEAR_TO, label: t('scrapper.year_to'), placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.YEAR_TO] ?? 0 },
];

// Function to generate additional filters config with translations
export const getAdditionalFiltersConfig = (t: (key: string) => string): AdditionalFiltersConfig => ({
  [SCRAPPING_SOURCES_ENUM.AUTORIA]: [
    {
      type: 'multiselect',
      name: AVAILABLE_FILTERS.STATE_IDS,
      label: t('scrapper.region'),
      placeholder: t('scrapper.pick_value'),
      data: REGION_UA,
    },
    {
      type: 'multiselect',
      name: AVAILABLE_FILTERS.FUEL_TYPE,
      label: t('scrapper.fuel_type'),
      placeholder: t('scrapper.pick_value'),
      data: FUEL_TYPES,
    },
  ],
  [SCRAPPING_SOURCES_ENUM.AUTOBazar]: [],
});

// Keep the old configs for backward compatibility (deprecated)
export const DEFAULT_FILTERS_CONFIG: FilterConfig[] = [
  { type: 'number', name: AVAILABLE_FILTERS.PRICE_FROM, label: 'scrapper.price_from', placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.PRICE_FROM] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.PRICE_TO, label: 'scrapper.price_to', placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.PRICE_TO] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.MILEAGE_FROM, label: 'scrapper.mileage_from', placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.MILEAGE_FROM] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.MILEAGE_TO, label: 'scrapper.mileage_to', placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.MILEAGE_TO] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.YEAR_FROM, label: 'scrapper.year_from', placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.YEAR_FROM] ?? 0 },
  { type: 'number', name: AVAILABLE_FILTERS.YEAR_TO, label: 'scrapper.year_to', placeholder: DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.YEAR_TO] ?? 0 },
];

interface AdditionalFiltersConfig {
    [key: string]: FilterConfig[];
}

// Keep the old configs for backward compatibility (deprecated)
export const ADDITIONAL_FILTERS_CONFIG: AdditionalFiltersConfig = {
  [SCRAPPING_SOURCES_ENUM.AUTORIA]: [
    {
      type: 'multiselect',
      name: AVAILABLE_FILTERS.STATE_IDS,
      label: 'scrapper.region',
      placeholder: 'scrapper.pick_value',
      data: REGION_UA,
    },
    {
      type: 'multiselect',
      name: AVAILABLE_FILTERS.FUEL_TYPE,
      label: 'scrapper.fuel_type',
      placeholder: 'scrapper.pick_value',
      data: FUEL_TYPES,
    },
  ],
  [SCRAPPING_SOURCES_ENUM.AUTOBazar]: [],
};

export interface IParsedCarItem {
    id: number;
    url: string;
    phone: string;
    year: string;
    active_ads: string;
    brand: string;
    created_at: string;
    mileage: string,
    model: string,
    path: string,
    price: string,
    raw?: string,
    registration_number: string,
    seller_name?: string,
    title: string,
    total_ads: string,
    updated_at: string,
}