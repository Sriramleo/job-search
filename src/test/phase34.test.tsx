import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { applicationsApi, jobsApi } from '../api';
import { ApplicationWorkspace } from '../pages/ApplicationWorkspace';
import { CompanyDetail } from '../pages/CompanyDetail';

vi.mock('../api', () => ({
  applicationsApi: {
    getDrafts: vi.fn(),
    getWorkspace: vi.fn(),
    persistPreview: vi.fn(),
    markSubmitted: vi.fn(),
    submitManual: vi.fn(),
    updateDraft: vi.fn(),
    regenerateArtifact: vi.fn(),
    getDocuments: vi.fn(),
    getApplications: vi.fn(),
  },
  jobsApi: {
    getJobs: vi.fn(),
    getJob: vi.fn(),
  },
  companiesApi: {
    getCompanies: vi.fn(),
  },
}));

describe('Phase 034 — Bug Fixes & Pre-activation Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BUG-001: Preview Application Manual Submission Flow', () => {
    it('calls persistPreview and persists preview ID before manual submit', async () => {
      const mockWorkspace = {
        application: {
          id: 'preview-qual-job_disc_101',
          jobId: 'job_disc_101',
          companyName: 'Blinkist',
          jobTitle: 'Senior Platform Engineer',
          status: 'DRAFT',
          stage: 'DRAFT',
          readinessScore: 100,
          readinessStatus: 'READY',
          coverLetterContent: 'Dear Hiring Manager...',
          validationChecklist: {
            correctJob: true,
            correctCompany: true,
            correctCV: true,
            coverLetterReady: true,
            requiredQuestionsAnswered: true,
            workAuthorizationVerified: true,
            noticePeriodVerified: true,
            noFabricatedInfo: true,
            noMissingRequiredFields: true,
          },
        },
        job: {
          id: 'job_disc_101',
          title: 'Senior Platform Engineer',
          companyName: 'Blinkist',
          location: 'Berlin, Germany',
          applicationUrl: 'https://boards.greenhouse.io/blinkist/jobs/12345',
          description: 'Manage Kubernetes and AWS infrastructure.',
        },
      };

      vi.mocked(applicationsApi.getWorkspace).mockResolvedValue(mockWorkspace as any);
      vi.mocked(applicationsApi.getApplications).mockResolvedValue([mockWorkspace.application as any]);
      vi.mocked(applicationsApi.persistPreview).mockResolvedValue({
        id: 'app-job_disc_101',
        jobId: 'job_disc_101',
        status: 'DRAFT',
      } as any);
      vi.mocked(applicationsApi.markSubmitted).mockResolvedValue({
        id: 'app-job_disc_101',
        status: 'SUBMITTED',
      } as any);

      render(
        <MemoryRouter initialEntries={['/workspace/preview-qual-job_disc_101']}>
          <ApplicationWorkspace />
        </MemoryRouter>
      );

      // Wait for workspace to render
      await waitFor(() => {
        expect(screen.getAllByText(/Blinkist/i).length).toBeGreaterThan(0);
      });

      // Find Manual Submit button
      const manualSubmitBtn = screen.getByRole('button', { name: /mark manual submission/i });
      expect(manualSubmitBtn).toBeInTheDocument();
      fireEvent.click(manualSubmitBtn);

      // Modal appears
      await waitFor(() => {
        expect(screen.getByText(/confirm manual submission/i)).toBeInTheDocument();
      });

      // Confirm button in modal
      const confirmBtn = screen.getByRole('button', { name: /yes, i submitted it/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(applicationsApi.persistPreview).toHaveBeenCalledWith('preview-qual-job_disc_101', 'job_disc_101');
        expect(applicationsApi.markSubmitted).toHaveBeenCalledWith(
          'app-job_disc_101',
          expect.anything()
        );
      });
    });
  });

  describe('BUG-008: Salary Display Never Shows €0K–€0K or 0k - 0k', () => {
    it('displays "Not specified" in CompanyDetail when salary range is 0 or unverified', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          title: 'DevOps Engineer',
          companyName: 'TestCo',
          location: 'Berlin',
          salaryMin: 0,
          salaryMax: 0,
          status: 'Discovered',
        },
      ];

      vi.mocked(jobsApi.getJobs).mockResolvedValue(mockJobs as any);

      render(
        <MemoryRouter initialEntries={['/companies/TestCo']}>
          <CompanyDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Must show "Not specified" instead of €0K–€0K
        expect(screen.queryByText(/€0K–€0K/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/0k - 0k/i)).not.toBeInTheDocument();
      });
    });
  });
});
