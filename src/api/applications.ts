import { apiClient } from './client';
import { store } from './store';
import { Application } from '../types';

export interface ApplicationFilterParams {
  stage?: string;
  route?: string;
  automationState?: string;
  companyId?: string;
  jobId?: string;
  limit?: number;
  skip?: number;
}

export interface MarkSubmittedParams {
  notes?: string;
  submissionMethod?: string;
  externalReference?: string;
  submittedAt?: string;
}

export const applicationsApi = {
  async getApplications(params?: ApplicationFilterParams): Promise<Application[]> {
    try {
      return await apiClient.get<Application[]>('/applications', { params: params as any });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Applications API call failed, falling back to mock store:', err);
      let apps = store.getApplications();
      if (params?.stage && params.stage !== 'all') {
        apps = apps.filter((a) => a.stage === params.stage);
      }
      return apps;
    }
  },

  async getApplication(id: string): Promise<Application | null> {
    try {
      return await apiClient.get<Application>(`/applications/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      if (import.meta.env.PROD) throw err;
      return store.getApplicationById(id) || null;
    }
  },

  async updateApplication(id: string, update: Partial<Application>): Promise<Application> {
    try {
      return await apiClient.patch<Application>(`/applications/${id}`, update);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateApplication(id, update);
    }
  },

  async attestClaim(applicationId: string, claimId: string, notes?: string): Promise<Application> {
    try {
      return await apiClient.post<Application>(`/applications/${applicationId}/claims/${claimId}/attest`, {
        candidateId: 'cand-sriram',
        attestationNotes: notes || 'Attested by candidate',
      });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      const app = store.getApplicationById(applicationId);
      if (!app) throw new Error(`Application ${applicationId} not found`);
      const updatedClaims = (app.claims || []).map((c) =>
        c.id === claimId
          ? { ...c, status: 'Verified' as const, sourceEvidenceSummary: notes, flagReason: undefined }
          : c
      );
      return store.updateApplication(applicationId, { claims: updatedClaims });
    }
  },

  async getWorkspace(applicationId: string) {
    try {
      return await apiClient.get(`/applications/${applicationId}/workspace`);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async prepareApplication(applicationId: string, forceRefresh = false) {
    try {
      return await apiClient.post(`/applications/${applicationId}/prepare`, null, {
        params: { forceRefresh },
      });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  async getPreparation(applicationId: string) {
    try {
      return await apiClient.get(`/applications/${applicationId}/preparation`);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return null;
    }
  },

  /**
   * CRITICAL HUMAN SAFETY BOUNDARY:
   * Explicit confirmation that candidate has manually submitted the application in external ATS.
   */
  async markSubmitted(applicationId: string, request?: MarkSubmittedParams): Promise<Application> {
    try {
      return await apiClient.post<Application>(`/applications/${applicationId}/mark-submitted`, request || {});
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateApplication(applicationId, {
        stage: 'Applied',
        appliedDate: new Date().toISOString().split('T')[0],
        automationState: 'Submitted',
      });
    }
  },

  async startAutomation(applicationId: string, options?: any) {
    return await apiClient.post(`/applications/${applicationId}/automation/start`, options || {});
  },

  async getAutomationSession(applicationId: string) {
    try {
      return await apiClient.get(`/applications/${applicationId}/automation`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async approveFill(applicationId: string, sessionId: string, approvedBy = 'human') {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/approve-fill`,
      { approved_by: approvedBy }
    );
  },

  async pauseAutomation(applicationId: string, sessionId: string, reason?: string) {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/pause`,
      { reason }
    );
  },

  async resumeAutomation(applicationId: string, sessionId: string, notes?: string) {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/resume`,
      { notes }
    );
  },

  async cancelAutomation(applicationId: string, sessionId: string, reason?: string) {
    return await apiClient.post(
      `/applications/${applicationId}/automation/${sessionId}/cancel`,
      { reason }
    );
  },
};
