import type {
  HistoryChangeStatus,
  HistoryVehicleSummary,
} from '../../types/historyModeration';

/** Warning codes with their own translation; anything else shows as UNKNOWN. */
export const CHECK_CODES = new Set([
  'MILEAGE_BELOW_PREVIOUS',
  'MILEAGE_ABOVE_NEXT',
  'DATE_BEFORE_VEHICLE_YEAR',
  'COST_JUMP',
  'LINE_ITEMS_TOTAL_MISMATCH',
]);

export function statusBadgeColor(status: HistoryChangeStatus): string {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'APPROVED':
    case 'AUTO_APPLIED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'STALE':
      return 'orange';
    default:
      return 'gray';
  }
}

/** "WVWZZZ1KZAW000001 · WA 12345 · 2015" — whichever identifiers the vehicle has. */
export function formatVehicle(vehicle: HistoryVehicleSummary): string {
  const parts = [vehicle.vin, vehicle.plateNumber, vehicle.year?.toString()].filter(Boolean);
  return parts.length ? parts.join(' · ') : vehicle.id;
}
