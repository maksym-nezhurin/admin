import apiClient from '../api/apiClient';
import { unwrapApiData } from '../utils/unwrapApiData';
import type { AdminCompanyRow, AdminOverview, AdminUserRow } from '../types/b2bAdmin';

const PREFIX = 'v1/admin';

export const b2bAdminService = {
  async getOverview(): Promise<AdminOverview> {
    const res = await apiClient.get(`${PREFIX}/overview`);
    return unwrapApiData<AdminOverview>(res.data);
  },

  async getUsers(): Promise<AdminUserRow[]> {
    const res = await apiClient.get(`${PREFIX}/users`);
    const data = unwrapApiData<AdminUserRow[]>(res.data);
    return Array.isArray(data) ? data : [];
  },

  async getCompanies(): Promise<AdminCompanyRow[]> {
    const res = await apiClient.get(`${PREFIX}/companies`);
    const data = unwrapApiData<AdminCompanyRow[]>(res.data);
    return Array.isArray(data) ? data : [];
  },

  async setPersonVerification(userId: string, status: string): Promise<void> {
    await apiClient.patch(`${PREFIX}/users/${userId}/person-verification`, { status });
  },

  async setPartnerListingStatus(listingId: string, status: string): Promise<void> {
    await apiClient.patch(`${PREFIX}/partner-listings/${listingId}/status`, { status });
  },

  async setCompanyStatus(companyId: string, status: string): Promise<void> {
    await apiClient.patch(`${PREFIX}/companies/${companyId}/status`, { status });
  },
};
