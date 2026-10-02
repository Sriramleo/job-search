import { apiClient } from './client';
import { store } from './store';
import { Company } from '../types';

export const companiesApi = {
  async getCompanies(search?: string): Promise<Company[]> {
    try {
      const params = search ? { search } : undefined;
      return await apiClient.get<Company[]>('/companies', { params });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Companies API call failed, falling back to mock store:', err);
      let companies = store.getCompanies();
      if (search) {
        const q = search.toLowerCase();
        companies = companies.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.germanyLocations.some((loc) => loc.toLowerCase().includes(q))
        );
      }
      return companies;
    }
  },

  async getCompany(id: string): Promise<Company | null> {
    try {
      return await apiClient.get<Company>(`/companies/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      if (import.meta.env.PROD) throw err;
      return store.getCompanyById(id) || null;
    }
  },
};
