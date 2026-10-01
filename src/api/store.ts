import {
  Job,
  Company,
  Contact,
  Application,
  Document,
  Interview,
  Task,
  ResearchEvidence,
  Communication,
  AutomationRun,
  AIUsage,
  Candidate,
  CandidateEvidence,
} from '../types';

import { mockCandidate, mockCandidateEvidence } from '../mocks/candidate';
import { mockCompanies } from '../mocks/companies';
import { mockJobs } from '../mocks/jobs';
import { mockContacts } from '../mocks/contacts';
import { mockApplications } from '../mocks/applications';
import { mockDocuments } from '../mocks/documents';
import { mockInterviews } from '../mocks/interviews';
import { mockTasks } from '../mocks/tasks';
import { mockResearchEvidence } from '../mocks/evidence';
import { mockCommunications } from '../mocks/communications';
import { mockAutomationRuns, mockAIUsage, mockAnalyticsData } from '../mocks/automation';

// In-memory state store with deep cloned mock datasets
class MockStore {
  private candidate: Candidate = { ...mockCandidate };
  private candidateEvidence: CandidateEvidence[] = [...mockCandidateEvidence];
  private companies: Company[] = [...mockCompanies];
  private jobs: Job[] = [...mockJobs];
  private contacts: Contact[] = [...mockContacts];
  private applications: Application[] = [...mockApplications];
  private documents: Document[] = [...mockDocuments];
  private interviews: Interview[] = [...mockInterviews];
  private tasks: Task[] = [...mockTasks];
  private researchEvidence: ResearchEvidence[] = [...mockResearchEvidence];
  private communications: Communication[] = [...mockCommunications];
  private automationRuns: AutomationRun[] = [...mockAutomationRuns];
  private aiUsage: AIUsage[] = [...mockAIUsage];

  // Candidate
  getCandidate(): Candidate {
    return { ...this.candidate };
  }
  updateCandidate(update: Partial<Candidate>): Candidate {
    this.candidate = { ...this.candidate, ...update };
    return { ...this.candidate };
  }
  getCandidateEvidence(): CandidateEvidence[] {
    return [...this.candidateEvidence];
  }

  // Jobs
  getJobs(): Job[] {
    return [...this.jobs];
  }
  getJobById(id: string): Job | undefined {
    return this.jobs.find((j) => j.id === id);
  }
  updateJob(id: string, update: Partial<Job>): Job {
    const idx = this.jobs.findIndex((j) => j.id === id);
    if (idx !== -1) {
      this.jobs[idx] = { ...this.jobs[idx], ...update };
      return this.jobs[idx];
    }
    throw new Error(`Job ${id} not found`);
  }

  // Companies
  getCompanies(): Company[] {
    return [...this.companies];
  }
  getCompanyById(id: string): Company | undefined {
    return this.companies.find((c) => c.id === id);
  }

  // Contacts
  getContacts(): Contact[] {
    return [...this.contacts];
  }
  getContactById(id: string): Contact | undefined {
    return this.contacts.find((c) => c.id === id);
  }
  addContactMessage(contactId: string, message: { type: 'LinkedIn' | 'Email'; direction: 'Outbound'; subject?: string; body: string }): Contact {
    const contact = this.contacts.find((c) => c.id === contactId);
    if (!contact) throw new Error(`Contact ${contactId} not found`);
    const newMsg = {
      id: `msg-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...message,
    };
    contact.messages = [...contact.messages, newMsg];
    contact.lastContactDate = newMsg.date;
    return { ...contact };
  }

  // Applications
  getApplications(): Application[] {
    return [...this.applications];
  }
  getApplicationById(id: string): Application | undefined {
    return this.applications.find((a) => a.id === id);
  }
  updateApplication(id: string, update: Partial<Application>): Application {
    const idx = this.applications.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.applications[idx] = {
        ...this.applications[idx],
        ...update,
        updatedDate: new Date().toISOString().split('T')[0],
      };
      return this.applications[idx];
    }
    throw new Error(`Application ${id} not found`);
  }

  // Documents
  getDocuments(): Document[] {
    return [...this.documents];
  }
  getDocumentById(id: string): Document | undefined {
    return this.documents.find((d) => d.id === id);
  }
  updateDocument(id: string, update: Partial<Document>): Document {
    const idx = this.documents.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.documents[idx] = { ...this.documents[idx], ...update, updatedAt: new Date().toISOString().split('T')[0] };
      return this.documents[idx];
    }
    throw new Error(`Document ${id} not found`);
  }

  // Interviews
  getInterviews(): Interview[] {
    return [...this.interviews];
  }

  // Tasks
  getTasks(): Task[] {
    return [...this.tasks];
  }
  updateTask(id: string, update: Partial<Task>): Task {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], ...update };
      return this.tasks[idx];
    }
    throw new Error(`Task ${id} not found`);
  }
  createTask(newTask: Omit<Task, 'id'>): Task {
    const task: Task = {
      ...newTask,
      id: `tsk-${Date.now()}`,
    };
    this.tasks = [task, ...this.tasks];
    return task;
  }

  // Research
  getResearchEvidence(): ResearchEvidence[] {
    return [...this.researchEvidence];
  }

  // Communications
  getCommunications(): Communication[] {
    return [...this.communications];
  }
  markCommunicationAsRead(id: string): Communication {
    const comm = this.communications.find((c) => c.id === id);
    if (comm) {
      comm.isRead = true;
      return { ...comm };
    }
    throw new Error(`Communication ${id} not found`);
  }

  // Automation & Analytics
  getAutomationRuns(): AutomationRun[] {
    return [...this.automationRuns];
  }
  toggleAutomationRun(id: string): AutomationRun {
    const run = this.automationRuns.find((r) => r.id === id);
    if (run) {
      run.enabled = !run.enabled;
      return { ...run };
    }
    throw new Error(`Automation run ${id} not found`);
  }
  getAIUsage(): AIUsage[] {
    return [...this.aiUsage];
  }
  getAnalyticsData() {
    return { ...mockAnalyticsData };
  }
}

export const store = new MockStore();
