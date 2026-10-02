import { apiClient } from './client';
import { store } from './store';
import { Contact } from '../types';

export interface ContactFilterParams {
  relationship?: string;
  companyId?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export const contactsApi = {
  async getContacts(filter?: string | ContactFilterParams): Promise<Contact[]> {
    try {
      const params: Record<string, any> = {};
      if (typeof filter === 'string') {
        if (filter && filter !== 'all') params.relationship = filter;
      } else if (filter) {
        if (filter.relationship && filter.relationship !== 'all') params.relationship = filter.relationship;
        if (filter.companyId) params.companyId = filter.companyId;
        if (filter.search) params.search = filter.search;
        if (filter.limit) params.limit = filter.limit;
        if (filter.skip) params.skip = filter.skip;
      }
      return await apiClient.get<Contact[]>('/contacts', { params });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Contacts API call failed, falling back to mock store:', err);
      let contacts = store.getContacts();
      const rel = typeof filter === 'string' ? filter : filter?.relationship;
      if (rel && rel !== 'all') {
        contacts = contacts.filter((c) => c.relationship === rel);
      }
      return contacts;
    }
  },

  async getContact(id: string): Promise<Contact | null> {
    try {
      return await apiClient.get<Contact>(`/contacts/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      if (import.meta.env.PROD) throw err;
      return store.getContactById(id) || null;
    }
  },

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    try {
      return await apiClient.post<Contact>('/contacts', contact);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.createContact ? store.createContact(contact as any) : (contact as Contact);
    }
  },

  async updateContact(id: string, update: Partial<Contact>): Promise<Contact> {
    try {
      return await apiClient.patch<Contact>(`/contacts/${id}`, update);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateContact(id, update);
    }
  },

  async addContactMessage(
    contactId: string,
    message: { type: 'LinkedIn' | 'Email'; direction: 'Outbound'; subject?: string; body: string }
  ): Promise<Contact> {
    try {
      return await apiClient.post<Contact>(`/contacts/${contactId}/messages`, message);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.addContactMessage(contactId, message);
    }
  },

  async verifyContact(
    contactId: string,
    payload: { verifiedBy?: string; verificationNotes?: string; relationshipConfirmed?: boolean } = {}
  ): Promise<Contact> {
    try {
      return await apiClient.post<Contact>(`/contacts/${contactId}/verify`, {
        verifiedBy: payload.verifiedBy || 'candidate',
        verificationNotes: payload.verificationNotes || 'Verified by human in UI',
        relationshipConfirmed: payload.relationshipConfirmed ?? true,
      });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateContact(contactId, {
        isReferralVerified: true,
        verificationStatus: 'verified',
      } as any);
    }
  },
};
