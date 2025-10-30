import { useQuery } from '@tanstack/react-query';
import * as adminApi from '../endpoints/admin';

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  reports: () => [...adminKeys.all, 'reports'] as const,
};

// ===== QUERIES =====

// Get Admin Reports (Admin Only)
export const useGetAdminReports = () =>
  useQuery({
    queryKey: adminKeys.reports(),
    queryFn: () => adminApi.getAdminReports(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
