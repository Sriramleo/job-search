import { store } from './store';
import { Company, Contact } from '../types';
import { backendCompaniesApi, backendContactsApi, isBackendConnected } from './backendClient';

export const companiesApi = {
  async getCompanies(search?: string): Promise<Company[]> {
    if (isBackendConnected()) {
      try {
        return await backendCompaniesApi.getCompanies(search);
      } catch (err) {
        console.warn('Backend getCompanies failed, falling back to mock store:', err);
      }
    }
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
  },

  async getCompany(id: string): Promise<Company | null> {
    if (isBackendConnected()) {
      try {
        const comp = await backendCompaniesApi.getCompany(id);
        if (comp) return comp;
      } catch (err) {
        console.warn(`Backend getCompany(${id}) failed, falling back to mock store:`, err);
      }
    }
    const comp = store.getCompanyById(id);
    return comp || null;
  },
};

export const contactsApi = {
  async getContacts(relationshipFilter?: string): Promise<Contact[]> {
    if (isBackendConnected()) {
      try {
        return await backendContactsApi.getContacts(relationshipFilter);
      } catch (err) {
        console.warn('Backend getContacts failed, falling back to mock store:', err);
      }
    }
    let contacts = store.getContacts();
    if (relationshipFilter && relationshipFilter !== 'all') {
      contacts = contacts.filter((c) => c.relationship === relationshipFilter);
    }
    return contacts;
  },

  async getContact(id: string): Promise<Contact | null> {
    if (isBackendConnected()) {
      try {
        const contact = await backendContactsApi.getContact(id);
        if (contact) return contact;
      } catch (err) {
        console.warn(`Backend getContact(${id}) failed, falling back to mock store:`, err);
      }
    }
    const contact = store.getContactById(id);
    return contact || null;
  },

  async addContactMessage(
    contactId: string,
    message: { type: 'LinkedIn' | 'Email'; direction: 'Outbound'; subject?: string; body: string }
  ): Promise<Contact> {
    if (isBackendConnected()) {
      try {
        return await backendContactsApi.addContactMessage(contactId, message);
      } catch (err) {
        console.warn(`Backend addContactMessage(${contactId}) failed, falling back to mock store:`, err);
      }
    }
    return store.addContactMessage(contactId, message);
  },
};

