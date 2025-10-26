const API_PREFIX = `v1`;
const CHARACTERISTICS_API_URL = import.meta.env.VITE_CHARACTERISTICS_API_URL;
const BRANDS_API_URL = `${CHARACTERISTICS_API_URL}charachteristics/brands`;

export const ROUTES = {
  AUTH: `${API_PREFIX}/auth`,
  CARS: `${API_PREFIX}/cars`,
  CHARACTERISTICS: {
    BRANDS: BRANDS_API_URL, // &year=${year}`,
    BRANDS_BY_YEAR: (year: number) => `${BRANDS_API_URL}/${year}`,
    MODELS_BY_YEAR: (year: number, brand: string) => `${BRANDS_API_URL}/${year}/${brand}`,
    VARIANTS: (year: number, brand: string, model: string) => `${BRANDS_API_URL}/${year}/${brand}/${model}`,
  },
};