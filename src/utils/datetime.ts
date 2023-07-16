import { DateRangeRequest } from '../model';

export function dateRangeOrDefault(dateRange: DateRangeRequest) {
  const { from, to } = dateRange;
  const startDate = new Date(from ?? 0);
  const endDate = new Date(to ?? '9999-12-31');

  return { startDate, endDate };
}
