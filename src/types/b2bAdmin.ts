export type AdminOverview = {
  users: {
    total: number;
    last7Days: number;
    last30Days: number;
    byPersonVerification: Record<string, number>;
  };
  companies: {
    total: number;
    last7Days: number;
    last30Days: number;
    byStatus: Record<string, number>;
  };
  partnerListings: {
    published: number;
    byStatus: Record<string, number>;
  };
  garage: {
    vehicles: {
      total: number;
      last7Days: number;
      last30Days: number;
    };
    garage: {
      entriesTotal: number;
      last7Days: number;
      last30Days: number;
    };
    saleListings: {
      active: number;
    };
  } | null;
  garageAvailable: boolean;
  recent: {
    users: Array<{
      id: string;
      email: string;
      username: string;
      createdAt: string;
      personVerificationStatus: string;
    }>;
    companies: Array<{
      id: string;
      displayName: string;
      status: string;
      createdAt: string;
      ownerEmail: string | null;
    }>;
  };
};

export type AdminUserRow = {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  countryCode: string | null;
  createdAt: string;
  personVerificationStatus: string;
  isActive: boolean;
  roles: string[];
  companies: Array<{
    id: string;
    displayName: string;
    status: string;
    countryCode: string;
    createdAt: string;
    serviceCategory: string | null;
    partnerListing: {
      id: string;
      slug: string;
      status: string;
      displayName: string;
      city: string;
      regionId: string;
    } | null;
  }>;
};

export type AdminCompanyRow = {
  id: string;
  displayName: string;
  name: string;
  status: string;
  countryCode: string;
  createdAt: string;
  owner: {
    id: string;
    email: string;
    username: string;
    personVerificationStatus: string;
  } | null;
  serviceCategory: string | null;
  partnerListing: {
    id: string;
    slug: string;
    status: string;
    displayName: string;
    city: string;
    regionId: string;
  } | null;
};
