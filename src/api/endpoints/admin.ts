import { apiClient } from '../client';

// Get Admin Reports (Admin Only)
export const getAdminReports = () =>
  apiClient
    .get<any[]>('/admin/reports')
    .then((res) => res.data);
