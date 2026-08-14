export type CatalogReviewStatus = 'approved' | 'draft' | 'rejected';

export type CatalogAdminTrim = {
  id: string;
  slug: string;
  displayName: string;
  engine: string | null;
  fuelType: string | null;
  aspiration: string | null;
  powerHp: number | null;
  transmission: string | null;
  reviewStatus: CatalogReviewStatus;
};

export type CatalogAdminGeneration = {
  id: string;
  slug: string;
  displayName: string;
  yearFrom: number | null;
  yearTo: number | null;
  coverImageUrl: string | null;
  reviewStatus: CatalogReviewStatus;
  isSupported: boolean;
  supportTier: string;
  make: { id: string; slug: string; name: string };
  model: { id: string; slug: string; name: string };
  trims: CatalogAdminTrim[];
};

export type UpdateGenerationAdminPayload = {
  reviewStatus?: CatalogReviewStatus;
  displayName?: string;
  coverImageUrl?: string;
};
