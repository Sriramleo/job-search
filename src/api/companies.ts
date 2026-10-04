import { apiClient } from './client';
import { Company } from '../types';

export const companiesApi = {
  async getCompanies(search?: string): Promise<Company[]> {
    const params = search ? { search } : undefined;
    return await apiClient.get<Company[]>('/companies', { params });
  },

  async getCompany(id: string): Promise<Company | null> {
    try {
      return await apiClient.get<Company>(`/companies/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },
};

