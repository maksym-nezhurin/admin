import { ROUTES } from './constant';
import axios from 'axios';

export const charachteristicsService = {
  /**
   * Get car brands (makes) for a specific year
   */
  async getBrandsByYear(year: string | number): Promise<{ value: string; label: string }[]> {
    const { data } = await axios.get(`${ROUTES.CHARACTERISTICS.BRANDS_BY_YEAR(year)}`);

    return data;
  },

  /**
   * Get car models for a specific brand and year
   */
  async getModelsByBrandAndYear(brandId: string, year: string | number): Promise<{ value: string; label: string }[]> {
    const { data } = await axios.get(`${ROUTES.CHARACTERISTICS.MODELS_BY_YEAR(year, brandId)}`);

    return data;
  },
}