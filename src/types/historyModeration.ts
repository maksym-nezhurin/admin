export type HistoryTargetType = 'MAINTENANCE' | 'SERVICE_VISIT';
export type HistoryChangeAction = 'UPDATE' | 'DELETE';
export type HistoryChangeStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'STALE'
  | 'AUTO_APPLIED';

export const HISTORY_CHANGE_STATUSES: HistoryChangeStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'STALE',
  'CANCELLED',
  'AUTO_APPLIED',
];

/** Soft check result stored on the request (car-service service-history-checks.ts). */
export type HistoryCheckWarning = { code: string; message: string };

/** Snapshot of a record's editable fields; dates are ISO strings, money is a number. */
export type HistoryRecordState = Record<string, unknown>;

export type HistoryVehicleSummary = {
  id: string;
  vin: string | null;
  year: number | null;
  plateNumber: string | null;
  brandId: string | null;
  modelId: string | null;
};

export type HistoryChangeRequest = {
  id: string;
  vehicleId: string;
  targetType: HistoryTargetType;
  targetId: string;
  action: HistoryChangeAction;
  status: HistoryChangeStatus;
  requestedByUserId: string;
  reason: string | null;
  proposed: HistoryRecordState | null;
  snapshotBefore: HistoryRecordState;
  targetVersion: number;
  checks: HistoryCheckWarning[];
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: HistoryVehicleSummary;
};

export type HistoryChangeRequestDetail = HistoryChangeRequest & {
  changedFields: string[];
  current: { state: HistoryRecordState; version: number; deletedAt: string | null } | null;
  /** Approving now would mark the request STALE instead of applying it. */
  isStale: boolean;
};

export type HistoryChangeRequestPage = {
  items: HistoryChangeRequest[];
  total: number;
  page: number;
  pageSize: number;
};

export type HistoryChangeRequestQuery = {
  status?: HistoryChangeStatus;
  targetType?: HistoryTargetType;
  page?: number;
  pageSize?: number;
};
