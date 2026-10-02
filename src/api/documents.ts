import { apiClient } from './client';
import { store } from './store';
import { Document } from '../types';

export interface DocumentFilterParams {
  type?: string;
  jobId?: string;
  applicationId?: string;
  limit?: number;
  skip?: number;
}

export const documentsApi = {
  async getDocuments(filter?: string | DocumentFilterParams): Promise<Document[]> {
    try {
      const params: Record<string, any> = {};
      if (typeof filter === 'string') {
        if (filter && filter !== 'all') params.type = filter;
      } else if (filter) {
        if (filter.type && filter.type !== 'all') params.type = filter.type;
        if (filter.jobId) params.jobId = filter.jobId;
        if (filter.applicationId) params.applicationId = filter.applicationId;
        if (filter.limit) params.limit = filter.limit;
        if (filter.skip) params.skip = filter.skip;
      }
      return await apiClient.get<Document[]>('/documents', { params });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Documents API call failed, falling back to mock store:', err);
      let docs = store.getDocuments();
      const type = typeof filter === 'string' ? filter : filter?.type;
      if (type && type !== 'all') {
        docs = docs.filter((d) => d.type === type);
      }
      return docs;
    }
  },

  async getDocument(id: string): Promise<Document | null> {
    try {
      return await apiClient.get<Document>(`/documents/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      if (import.meta.env.PROD) throw err;
      return store.getDocumentById(id) || null;
    }
  },

  async updateDocument(id: string, update: Partial<Document>): Promise<Document> {
    try {
      return await apiClient.patch<Document>(`/documents/${id}`, update);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateDocument(id, update);
    }
  },

  async createDocument(doc: Partial<Document>): Promise<Document> {
    try {
      return await apiClient.post<Document>('/documents', doc);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.createDocument ? store.createDocument(doc as any) : (doc as Document);
    }
  },
};
