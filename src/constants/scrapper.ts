export const SCRAPPING_MARKETS = [
    { label: 'Slovakia', value: 'SK' },
    { label: 'Ukraine', value: 'UA' },
];

enum SCRAPPING_SOURCES_ENUM {
    AUTOBazar = 'autobazar',
    AUTORIA = 'autoria',
}

const SLOVAKIA_SOURCES = [
    { label: 'Auto bazar EU', value: SCRAPPING_SOURCES_ENUM.AUTOBazar },
];

const UKRAINE_SOURCES = [
    { label: 'Auto Ria UA', value: SCRAPPING_SOURCES_ENUM.AUTORIA },
];

export const GET_SCRAPPING_SOURCES_BY_MARKET = (permission) => {
    switch (permission) {
        case 'SK':
            return SLOVAKIA_SOURCES;
        case 'UA':
            return UKRAINE_SOURCES;
        default:
            return [];
    }
}

export const SCRAPPING_SOURCES = [
    { label: 'Autobazar EU (SK)', value: SCRAPPING_SOURCES_ENUM.AUTOBazar },
    { label: 'Autoria UA', value: SCRAPPING_SOURCES_ENUM.AUTORIA },
];

export const FUEL_TYPES = [
  { value: "", label: "Будь-яке" },
  { value: "petrol", label: "Бензин" },
  { value: "diesel", label: "Дизель" },
  { value: "gas", label: "Газ/Бензин" },
  { value: "hybrid", label: "Гібрид" },
  { value: "phev", label: "Plug-In Hybrid" },
  { value: "electric", label: "Електро" },
];

const REGION_UA = [
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

export const DEFAULT_FILTERS_VALUES = {
    price_from: 12000,
    price_to: 14000,
    mileage_from: 50000,
    mileage_to: 70000,
    year_from: 2019,
    year_to: 2020,
    fuel_type: FUEL_TYPES[0].value, // Default fuel type
};

export const DEFAULT_FILTERS_CONFIG = [
    { type: "number", name: "price_from", label: "Ціна від", placeholder: DEFAULT_FILTERS_VALUES.price_from },
    { type: "number", name: "price_to", label: "Ціна до", placeholder: DEFAULT_FILTERS_VALUES.price_to },
    { type: "number", name: "mileage_from", label: "Пробіг від", placeholder: DEFAULT_FILTERS_VALUES.mileage_from },
    { type: "number", name: "mileage_to", label: "Пробіг до", placeholder: DEFAULT_FILTERS_VALUES.mileage_to },
    { type: "number", name: "year_from", label: "Рік від", placeholder: DEFAULT_FILTERS_VALUES.year_from },
    { type: "number", name: "year_to", label: "Рік до", placeholder: DEFAULT_FILTERS_VALUES.year_to },
];

export const ADDITIONAL_FILTERS_CONFIG = {
    [SCRAPPING_SOURCES_ENUM.AUTORIA]: [
        {
            type: "multiselect",
            name: "state_ids",
            label: "Регіон",
            placeholder: "Виберіть регіон",
            data: REGION_UA,
        },
        {
            type: "multiselect",
            name: "fuel_type",
            label: "Тип палива",
            placeholder: "Виберіть тип палива",
            data: FUEL_TYPES,
        }
    ],
    [SCRAPPING_SOURCES_ENUM.AUTOBazar]: [
        // {
        //     type: "select",
        //     name: "user_type",
        //     label: "Тип продавця",
        //     placeholder: "Виберіть тип",
        //     data: [
        //         { value: "1", label: "Приватна особа" },
        //         { value: "2", label: "Компанія" },
        //     ],
        // },
        // {
        //     type: "select",
        //     name: "gearbox",
        //     label: "КПП",
        //     placeholder: "Виберіть КПП",
        //     data: [
        //         { value: "31393", label: "Automatická" },
        //         { value: "31392", label: "Manuálna" },
        //     ],
        // },
    ],
};