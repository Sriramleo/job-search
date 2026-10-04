import { apiClient } from './client';
import { Candidate, CandidateEvidence } from '../types';

export const settingsApi = {
  async getCandidate(): Promise<Candidate> {
    return await apiClient.get<Candidate>('/candidates/cand-sriram');
  },

  async updateCandidate(update: Partial<Candidate>): Promise<Candidate> {
    return await apiClient.patch<Candidate>('/candidates/cand-sriram', update);
  },

  async getCandidateEvidence(): Promise<CandidateEvidence[]> {
    return await apiClient.get<CandidateEvidence[]>('/candidates/cand-sriram/evidence');
  },

  async getAIProviders() {
    try {
      return await apiClient.get('/system/ai-providers');
    } catch {
      return [];
    }
  },

  async updateAIProvider(providerId: string, updates: any) {
    return await apiClient.patch(`/system/ai-providers/${providerId}`, updates);
  },

  async getImmigrationParameters() {
    try {
      return await apiClient.get('/system/immigration-parameters');
    } catch {
      return [];
    }
  },
};

export const candidateApi = settingsApi;

