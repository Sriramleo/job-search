import { apiClient } from './client';

export const healthApi = {
  async getSystemHealth() {
    try {
      return await apiClient.get('/health');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return { status: 'unavailable', error: String(err) };
    }
  },

  async getReadiness() {
    try {
      return await apiClient.get('/health/ready');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return { status: 'not_ready', error: String(err) };
    }
  },

  async getLiveness() {
    try {
      return await apiClient.get('/health/live');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return { status: 'unavailable', error: String(err) };
    }
  },

  async getProviderHealth() {
    try {
      return await apiClient.get('/health/providers');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getDatabaseHealth() {
    try {
      return await apiClient.get('/health/database');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },
};
