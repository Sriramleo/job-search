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

export const applicationsApi = {
  async getApplications(): Promise<Application[]> {
    return store.getApplications();
  },

  async getApplication(id: string): Promise<Application | null> {
    const app = store.getApplicationById(id);
    return app || null;
  },

  async updateApplication(id: string, update: Partial<Application>): Promise<Application> {
    return store.updateApplication(id, update);
  },
};

export const documentsApi = {
  async getDocuments(typeFilter?: string): Promise<Document[]> {
    let docs = store.getDocuments();
    if (typeFilter && typeFilter !== 'all') {
      docs = docs.filter((d) => d.type === typeFilter);
    }
    return docs;
  },

  async getDocument(id: string): Promise<Document | null> {
    return store.getDocumentById(id) || null;
  },

  async updateDocument(id: string, update: Partial<Document>): Promise<Document> {
    return store.updateDocument(id, update);
  },
};

export const interviewsApi = {
  async getInterviews(): Promise<Interview[]> {
    return store.getInterviews();
  },
};

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    return store.getTasks();
  },

  async updateTask(id: string, update: Partial<Task>): Promise<Task> {
    return store.updateTask(id, update);
  },

  async createTask(newTask: Omit<Task, 'id'>): Promise<Task> {
    return store.createTask(newTask);
  },
};

export const researchApi = {
  async getResearchEvidence(categoryFilter?: string): Promise<ResearchEvidence[]> {
    let ev = store.getResearchEvidence();
    if (categoryFilter && categoryFilter !== 'all') {
      ev = ev.filter((e) => e.category === categoryFilter);
    }
    return ev;
  },
};

export const communicationsApi = {
  async getCommunications(folder?: string): Promise<Communication[]> {
    let comms = store.getCommunications();
    if (folder && folder !== 'All') {
      comms = comms.filter((c) => c.folder === folder);
    }
    return comms;
  },

  async markAsRead(id: string): Promise<Communication> {
    return store.markCommunicationAsRead(id);
  },
};

export const candidateApi = {
  async getCandidate(): Promise<Candidate> {
    return store.getCandidate();
  },

  async updateCandidate(update: Partial<Candidate>): Promise<Candidate> {
    return store.updateCandidate(update);
  },

  async getCandidateEvidence(): Promise<CandidateEvidence[]> {
    return store.getCandidateEvidence();
  },
};

export const automationApi = {
  async getAutomationRuns(): Promise<AutomationRun[]> {
    return store.getAutomationRuns();
  },

  async toggleAutomation(id: string): Promise<AutomationRun> {
    return store.toggleAutomationRun(id);
  },
};

export const analyticsApi = {
  async getAIUsage(): Promise<AIUsage[]> {
    return store.getAIUsage();
  },

  async getAnalyticsData() {
    return store.getAnalyticsData();
  },
};
