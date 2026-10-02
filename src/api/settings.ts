import { apiClient } from './client';
import { store } from './store';
import { Candidate, CandidateEvidence } from '../types';

export const settingsApi = {
  async getCandidate(): Promise<Candidate> {
    try {
      return await apiClient.get<Candidate>('/candidates/cand-sriram');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Candidate API call failed, falling back to mock store:', err);
      return store.getCandidate();
    }
  },

  async updateCandidate(update: Partial<Candidate>): Promise<Candidate> {
    try {
      return await apiClient.patch<Candidate>('/candidates/cand-sriram', update);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateCandidate(update);
    }
  },

  async getCandidateEvidence(): Promise<CandidateEvidence[]> {
    try {
      return await apiClient.get<CandidateEvidence[]>('/candidates/cand-sriram/evidence');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.getCandidateEvidence();
    }
  },

  async getAIProviders() {
    try {
      return await apiClient.get('/system/ai-providers');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return [];
    }
  },

  async updateAIProvider(providerId: string, updates: any) {
    return await apiClient.patch(`/system/ai-providers/${providerId}`, updates);
  },

  async getImmigrationParameters() {
    try {
      return await apiClient.get('/system/immigration-parameters');
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return [];
    }
  },
};

export const candidateApi = settingsApi;
