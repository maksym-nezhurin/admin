import apiClient from '../api/apiClient';
import { unwrapApiData } from '../utils/unwrapApiData';
import type {
  CatalogAdminGeneration,
  CatalogReviewStatus,
  UpdateGenerationAdminPayload,
} from '../types/catalogAdmin';

/** Proxied by gateway to car-service's CatalogAdminGuard-protected routes (ADMIN/SUPER_ADMIN). */
const PREFIX = 'v1/cars/catalog/admin';

export const catalogAdminService = {
  /** Bypasses the public review gate — this is the only way to find a flagged draft/rejected row again. */
  async lookupGeneration(
    makeSlug: string,
    modelSlug: string,
    generationSlug: string,
  ): Promise<CatalogAdminGeneration> {
    const res = await apiClient.get(
      `${PREFIX}/by-path/${makeSlug}/${modelSlug}/${generationSlug}`,
    );
    return unwrapApiData<CatalogAdminGeneration>(res.data);
  },

  async updateGeneration(id: string, payload: UpdateGenerationAdminPayload): Promise<void> {
    await apiClient.patch(`${PREFIX}/generations/${id}`, payload);
  },

  async updateTrimReviewStatus(id: string, reviewStatus: CatalogReviewStatus): Promise<void> {
    await apiClient.patch(`${PREFIX}/trims/${id}`, { reviewStatus });
  },
};
