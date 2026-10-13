import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { applicationsApi } from '../api';
import { Applications } from '../pages/Applications';

vi.mock('../api', () => ({
  applicationsApi: {
    getApplications: vi.fn(),
  },
  campaignApi: {
    getStatus: vi.fn().mockResolvedValue({ config: { dailyMaxApplications: 1, stage: 'STAGE_0_DRY_RUN' } }),
    getRuns: vi.fn().mockResolvedValue([]),
    getDailyReport: vi.fn().mockResolvedValue(null),
  },
}));

describe('Phase 038 — Submission Method Filtering & UI Cleanup', () => {
  const mockApps = [
    {
      id: 'app-auto-1',
      jobTitle: 'Data Platform Engineer',
      companyName: 'Wandelbots GmbH',
      location: 'Dresden, Germany',
      stage: 'Applied',
      automationState: 'Submitted',
      submissionMethod: 'AUTO',
      submittedAt: '2026-10-08T08:33:24Z',
      outcomeState: 'APPLICATION_RECEIVED',
    },
    {
      id: 'app-manual-1',
      jobTitle: 'Cloud Infrastructure Lead',
      companyName: '1KOMMA5°',
      location: 'Hamburg, Germany',
      stage: 'Applied',
      automationState: 'Submitted',
      submissionMethod: 'MANUAL',
      submittedAt: '2026-10-07T12:00:00Z',
      outcomeState: 'NO_RESPONSE',
    },
    {
      id: 'app-unknown-1',
      jobTitle: 'Senior DevOps Engineer',
      companyName: 'Target Company',
      location: 'Berlin, Germany',
      stage: 'Applied',
      automationState: 'Submitted',
      submissionMethod: 'UNKNOWN',
      appliedDate: '2026-10-05T09:41:18Z',
      outcomeState: 'NO_RESPONSE',
    },
    {
      id: 'app-ready-unsubmitted',
      jobTitle: 'Senior Platform Engineer',
      companyName: 'Blinkist',
      location: 'Berlin, Germany',
      stage: 'Preparing',
      automationState: 'Ready',
      submissionMethod: null,
      readinessState: 'AUTO_APPLY_READY',
      outcomeState: 'NO_RESPONSE',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (applicationsApi.getApplications as any).mockResolvedValue(mockApps);
  });

  it('renders Submission Method filter tabs with accurate counts', async () => {
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /All Submissions/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Auto \(ATS\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Manual Portal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unknown Method/i })).toBeInTheDocument();
    });
  });

  it('filters by Auto (ATS) and excludes manual and unsubmitted applications', async () => {
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /All Submissions/i })).toBeInTheDocument();
    });

    // Switch to Table view
    const tableBtn = screen.getByRole('button', { name: /table/i });
    fireEvent.click(tableBtn);

    // Click Auto (ATS) filter tab
    const autoTab = screen.getByRole('button', { name: /Auto \(ATS\)/i });
    fireEvent.click(autoTab);

    // Should only see Wandelbots (Auto)
    expect(screen.getByText('Wandelbots GmbH · Dresden, Germany ·')).toBeInTheDocument();
    expect(screen.queryByText('1KOMMA5° · Hamburg, Germany ·')).not.toBeInTheDocument();
    expect(screen.queryByText('Blinkist · Berlin, Germany ·')).not.toBeInTheDocument();
  });

  it('filters by Manual Portal and displays manual submission', async () => {
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Manual Portal/i })).toBeInTheDocument();
    });

    // Switch to Table view
    fireEvent.click(screen.getByRole('button', { name: /table/i }));

    // Click Manual Portal filter tab
    fireEvent.click(screen.getByRole('button', { name: /Manual Portal/i }));

    expect(screen.getByText('1KOMMA5° · Hamburg, Germany ·')).toBeInTheDocument();
    expect(screen.queryByText('Wandelbots GmbH · Dresden, Germany ·')).not.toBeInTheDocument();
    expect(screen.queryByText('Blinkist · Berlin, Germany ·')).not.toBeInTheDocument();
  });

  it('filters by Unknown Method showing legacy unverified records', async () => {
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unknown Method/i })).toBeInTheDocument();
    });

    // Switch to Table view
    fireEvent.click(screen.getByRole('button', { name: /table/i }));

    // Click Unknown Method filter tab
    fireEvent.click(screen.getByRole('button', { name: /Unknown Method/i }));

    expect(screen.getByText('Target Company · Berlin, Germany ·')).toBeInTheDocument();
    expect(screen.queryByText('Wandelbots GmbH · Dresden, Germany ·')).not.toBeInTheDocument();
    expect(screen.queryByText('1KOMMA5° · Hamburg, Germany ·')).not.toBeInTheDocument();
  });

  it('clarifies that AUTO_APPLY_READY does not infer Auto submission method', async () => {
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/AUTO_APPLY_READY/i)).toBeInTheDocument();
      expect(screen.getByText(/is an evaluation readiness state, not proof of automated submission/i)).toBeInTheDocument();
    });
  });

  it('does not render the redundant Open Active Workspace button', async () => {
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Open Active Workspace')).not.toBeInTheDocument();
    });
  });
});
