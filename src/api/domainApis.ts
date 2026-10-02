import { store } from './store';
import {
  Application,
  Document,
  Interview,
  Task,
  ResearchEvidence,
  Communication,
  Candidate,
  CandidateEvidence,
  AutomationRun,
  AIUsage,
} from '../types';
import {
  backendApplicationsApi,
  backendDocumentsApi,
  backendInterviewsApi,
  backendTasksApi,
  backendResearchApi,
  backendCommunicationsApi,
  backendCandidateApi,
  backendAutomationApi,
  backendAnalyticsApi,
  isBackendConnected,
} from './backendClient';

export const applicationsApi = {
  async getApplications(): Promise<Application[]> {
    if (isBackendConnected()) {
      try {
        return await backendApplicationsApi.getApplications();
      } catch (err) {
        console.warn('Backend getApplications failed, falling back to mock store:', err);
      }
    }
    return store.getApplications();
  },

  async getApplication(id: string): Promise<Application | null> {
    if (isBackendConnected()) {
      try {
        const app = await backendApplicationsApi.getApplication(id);
        if (app) return app;
      } catch (err) {
        console.warn(`Backend getApplication(${id}) failed, falling back to mock store:`, err);
      }
    }
    const app = store.getApplicationById(id);
    return app || null;
  },

  async updateApplication(id: string, update: Partial<Application>): Promise<Application> {
    if (isBackendConnected()) {
      try {
        return await backendApplicationsApi.updateApplication(id, update);
      } catch (err) {
        console.warn(`Backend updateApplication(${id}) failed, falling back to mock store:`, err);
      }
    }
    return store.updateApplication(id, update);
  },

  async attestClaim(applicationId: string, claimId: string, notes?: string): Promise<Application> {
    if (isBackendConnected()) {
      try {
        return await backendApplicationsApi.attestClaim(applicationId, claimId, notes);
      } catch (err) {
        console.warn('Backend attestClaim failed, falling back to mock store:', err);
      }
    }
    const app = store.getApplicationById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);
    const updatedClaims = (app.claims || []).map((c) =>
      c.id === claimId
        ? { ...c, status: 'Verified' as const, sourceEvidenceSummary: notes, flagReason: undefined }
        : c
    );
    return store.updateApplication(applicationId, { claims: updatedClaims });
  },

  async getWorkspace(applicationId: string) {
    if (isBackendConnected()) {
      try {
        return await backendApplicationsApi.getWorkspace(applicationId);
      } catch (err) {
        console.warn('Backend getWorkspace failed:', err);
      }
    }
    return null;
  },
};

export const documentsApi = {
  async getDocuments(typeFilter?: string): Promise<Document[]> {
    if (isBackendConnected()) {
      try {
        return await backendDocumentsApi.getDocuments(typeFilter);
      } catch (err) {
        console.warn('Backend getDocuments failed, falling back to mock store:', err);
      }
    }
    let docs = store.getDocuments();
    if (typeFilter && typeFilter !== 'all') {
      docs = docs.filter((d) => d.type === typeFilter);
    }
    return docs;
  },

  async getDocument(id: string): Promise<Document | null> {
    if (isBackendConnected()) {
      try {
        const doc = await backendDocumentsApi.getDocument(id);
        if (doc) return doc;
      } catch (err) {
        console.warn(`Backend getDocument(${id}) failed, falling back to mock store:`, err);
      }
    }
    return store.getDocumentById(id) || null;
  },

  async updateDocument(id: string, update: Partial<Document>): Promise<Document> {
    if (isBackendConnected()) {
      try {
        return await backendDocumentsApi.updateDocument(id, update);
      } catch (err) {
        console.warn(`Backend updateDocument(${id}) failed, falling back to mock store:`, err);
      }
    }
    return store.updateDocument(id, update);
  },
};

export const interviewsApi = {
  async getInterviews(): Promise<Interview[]> {
    if (isBackendConnected()) {
      try {
        return await backendInterviewsApi.getInterviews();
      } catch (err) {
        console.warn('Backend getInterviews failed, falling back to mock store:', err);
      }
    }
    return store.getInterviews();
  },
};

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    if (isBackendConnected()) {
      try {
        return await backendTasksApi.getTasks();
      } catch (err) {
        console.warn('Backend getTasks failed, falling back to mock store:', err);
      }
    }
    return store.getTasks();
  },

  async updateTask(id: string, update: Partial<Task>): Promise<Task> {
    if (isBackendConnected()) {
      try {
        return await backendTasksApi.updateTask(id, update);
      } catch (err) {
        console.warn(`Backend updateTask(${id}) failed, falling back to mock store:`, err);
      }
    }
    return store.updateTask(id, update);
  },

  async createTask(newTask: Omit<Task, 'id'>): Promise<Task> {
    if (isBackendConnected()) {
      try {
        return await backendTasksApi.createTask(newTask);
      } catch (err) {
        console.warn('Backend createTask failed, falling back to mock store:', err);
      }
    }
    return store.createTask(newTask);
  },
};

export const researchApi = {
  async getResearchEvidence(categoryFilter?: string): Promise<ResearchEvidence[]> {
    if (isBackendConnected()) {
      try {
        return await backendResearchApi.getResearchEvidence(categoryFilter);
      } catch (err) {
        console.warn('Backend getResearchEvidence failed, falling back to mock store:', err);
      }
    }
    let ev = store.getResearchEvidence();
    if (categoryFilter && categoryFilter !== 'all') {
      ev = ev.filter((e) => e.category === categoryFilter);
    }
    return ev;
  },
};

export const communicationsApi = {
  async getCommunications(folder?: string): Promise<Communication[]> {
    if (isBackendConnected()) {
      try {
        return await backendCommunicationsApi.getCommunications(folder);
      } catch (err) {
        console.warn('Backend getCommunications failed, falling back to mock store:', err);
      }
    }
    let comms = store.getCommunications();
    if (folder && folder !== 'All') {
      comms = comms.filter((c) => c.folder === folder);
    }
    return comms;
  },

  async markAsRead(id: string): Promise<Communication> {
    if (isBackendConnected()) {
      try {
        return await backendCommunicationsApi.markAsRead(id);
      } catch (err) {
        console.warn(`Backend markAsRead(${id}) failed, falling back to mock store:`, err);
      }
    }
    return store.markCommunicationAsRead(id);
  },
};

export const candidateApi = {
  async getCandidate(): Promise<Candidate> {
    if (isBackendConnected()) {
      try {
        return await backendCandidateApi.getCandidate();
      } catch (err) {
        console.warn('Backend getCandidate failed, falling back to mock store:', err);
      }
    }
    return store.getCandidate();
  },

  async updateCandidate(update: Partial<Candidate>): Promise<Candidate> {
    if (isBackendConnected()) {
      try {
        return await backendCandidateApi.updateCandidate(update);
      } catch (err) {
        console.warn('Backend updateCandidate failed, falling back to mock store:', err);
      }
    }
    return store.updateCandidate(update);
  },

  async getCandidateEvidence(): Promise<CandidateEvidence[]> {
    if (isBackendConnected()) {
      try {
        return await backendCandidateApi.getCandidateEvidence();
      } catch (err) {
        console.warn('Backend getCandidateEvidence failed, falling back to mock store:', err);
      }
    }
    return store.getCandidateEvidence();
  },
};

export const automationApi = {
  async getAutomationRuns(): Promise<AutomationRun[]> {
    if (isBackendConnected()) {
      try {
        return await backendAutomationApi.getAutomationRuns();
      } catch (err) {
        console.warn('Backend getAutomationRuns failed, falling back to mock store:', err);
      }
    }
    return store.getAutomationRuns();
  },

  async toggleAutomation(id: string): Promise<AutomationRun> {
    if (isBackendConnected()) {
      try {
        return await backendAutomationApi.toggleAutomation(id);
      } catch (err) {
        console.warn(`Backend toggleAutomation(${id}) failed, falling back to mock store:`, err);
      }
    }
    return store.toggleAutomationRun(id);
  },
};

export const analyticsApi = {
  async getAIUsage(): Promise<AIUsage[]> {
    if (isBackendConnected()) {
      try {
        return await backendAnalyticsApi.getAIUsage();
      } catch (err) {
        console.warn('Backend getAIUsage failed, falling back to mock store:', err);
      }
    }
    return store.getAIUsage();
  },

  async getAnalyticsData() {
    if (isBackendConnected()) {
      try {
        return await backendAnalyticsApi.getAnalyticsData();
      } catch (err) {
        console.warn('Backend getAnalyticsData failed, falling back to mock store:', err);
      }
    }
    return store.getAnalyticsData();
  },
};

