import apiClient from '../api/apiClient';
import { unwrapApiData } from '../utils/unwrapApiData';
import type {
  HistoryChangeRequest,
  HistoryChangeRequestDetail,
  HistoryChangeRequestPage,
  HistoryChangeRequestQuery,
} from '../types/historyModeration';

/** Proxied by gateway to car-service's admin-only service-history moderation routes. */
const PREFIX = 'v1/cars/admin/service-history/change-requests';

export const historyModerationService = {
  async list(query: HistoryChangeRequestQuery): Promise<HistoryChangeRequestPage> {
    const res = await apiClient.get(PREFIX, { params: query });
    return unwrapApiData<HistoryChangeRequestPage>(res.data);
  },

  async get(id: string): Promise<HistoryChangeRequestDetail> {
    const res = await apiClient.get(`${PREFIX}/${id}`);
    return unwrapApiData<HistoryChangeRequestDetail>(res.data);
  },

  /** Resolves with status APPROVED, or STALE when the record changed since the request. */
  async approve(id: string, note?: string): Promise<HistoryChangeRequest> {
    const res = await apiClient.post(`${PREFIX}/${id}/approve`, note ? { note } : {});
    return unwrapApiData<HistoryChangeRequest>(res.data);
  },

  async reject(id: string, note: string): Promise<HistoryChangeRequest> {
    const res = await apiClient.post(`${PREFIX}/${id}/reject`, { note });
    return unwrapApiData<HistoryChangeRequest>(res.data);
  },
};
