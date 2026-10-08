import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ApplicationReadinessCard } from '../components/jobs/ApplicationReadinessCard';
import { getJobTimestamp } from '../pages/Jobs';
import { getCommunicationTimestamp, sortCommunicationsNewestFirst } from '../pages/Inbox';
import { CampaignDashboard } from '../components/campaign/CampaignDashboard';
import { Job, Communication } from '../types';
import { jobsApi, campaignApi } from '../api';

const baseMockJob: Job = {
  id: 'job-1',
  title: 'Senior DevOps Engineer',
  companyId: 'comp-1',
  companyName: 'Acme Corp',
  location: 'Berlin, Germany',
  postedDate: '2026-10-08',
  requirements: [],
  whyMatchesProfile: { title: 'Fit', points: [] },
  gaps: [],
  salaryMin: 85000,
  salaryMax: 95000,
  salaryCurrency: 'EUR',
  status: 'Qualified',
  germanRequirement: 'None',
  workModel: 'Hybrid',
  seniority: 'Senior',
  technicalFit: 'Strong',
  seniorLeadFit: 'Strong',
  salaryFit: 'Strong',
  applicationReadiness: 'Strong',
  applicationRoute: 'Official Application',
  routeReason: 'Direct ATS',
  relocationStatus: 'Evidence Found',
  relocationSummary: 'Relocation supported',
  verificationStatus: 'VERIFIED',
  keySkills: ['Kubernetes', 'AWS'],
  description: 'DevOps role',
  applicationRequirements: {
    cv: 'Required',
    coverLetter: 'Optional',
    portfolio: 'Not Requested',
    salaryQuestion: 'Optional',
    noticePeriod: 'Optional',
    workAuthorization: 'Required',
    germanRequirement: 'Not Requested',
  },
  timeline: [],
  source: 'Direct Careers',
  sourceUrl: 'https://acme.com/job/1',
};

describe('Phase 031 Production Hardening — Jobs Sorting (BUG-003)', () => {
  it('extracts timestamps deterministically across mixed camelCase and snake_case keys', () => {
    expect(getJobTimestamp({ discoveredAt: '2026-10-08T12:00:00Z' })).toBe('2026-10-08T12:00:00Z');
    expect(getJobTimestamp({ discovered_at: '2026-10-08T10:00:00Z' })).toBe('2026-10-08T10:00:00Z');
    expect(getJobTimestamp({ verifiedAt: '2026-10-07T15:00:00Z' })).toBe('2026-10-07T15:00:00Z');
    expect(getJobTimestamp({ postedDate: '2026-10-06' })).toBe('2026-10-06');
    expect(getJobTimestamp({ posted_date: '2026-10-05' })).toBe('2026-10-05');
    expect(getJobTimestamp({})).toBe('');
    expect(getJobTimestamp(null)).toBe('');
  });

  it('orders jobs strictly newest-first A (Oct 8) -> B (Oct 7) -> C (Oct 6)', () => {
    const jobA = { ...baseMockJob, id: 'job-a', discoveredAt: '2026-10-08T14:00:00Z' };
    const jobB = { ...baseMockJob, id: 'job-b', discovered_at: '2026-10-07T09:00:00Z' };
    const jobC = { ...baseMockJob, id: 'job-c', postedDate: '2026-10-06' };
    const jobMissing = { ...baseMockJob, id: 'job-missing', discoveredAt: undefined, postedDate: undefined };

    const unsorted = [jobC, jobMissing, jobA, jobB];

    const sorted = [...unsorted].sort((a, b) => {
      const tsA = getJobTimestamp(a);
      const tsB = getJobTimestamp(b);
      if (tsA && tsB) {
        return tsB.localeCompare(tsA);
      } else if (tsA && !tsB) {
        return -1;
      } else if (!tsA && tsB) {
        return 1;
      }
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

    expect(sorted.map((j) => j.id)).toEqual(['job-a', 'job-b', 'job-c', 'job-missing']);
  });
});

describe('Phase 031 Production Hardening — Inbox Sorting (BUG-005)', () => {
  it('extracts communication timestamps with receivedAt precedence over date', () => {
    expect(
      getCommunicationTimestamp({
        receivedAt: '2026-10-08T12:00:00Z',
        date: '2026-10-01',
      })
    ).toBe('2026-10-08T12:00:00Z');

    expect(
      getCommunicationTimestamp({
        received_at: '2026-10-08T11:00:00Z',
      })
    ).toBe('2026-10-08T11:00:00Z');

    expect(
      getCommunicationTimestamp({
        date: '2026-10-05',
      })
    ).toBe('2026-10-05');
  });

  it('sorts inbox messages newest-first A (Oct 8 12:00) -> B (Oct 8 10:00) -> C (Oct 7 18:00)', () => {
    const comms: Communication[] = [
      {
        id: 'comm-c',
        subject: 'Email C',
        senderEmail: 'recruiter@c.com',
        senderName: 'Recruiter C',
        companyName: 'Company C',
        receivedAt: '2026-10-07T18:00:00Z',
        date: '2026-10-07',
        body: 'Full body C',
        folder: 'Recruiters',
        isRead: true,
        detectedType: 'Recruiter Outreach',
        actionRequired: false,
      },
      {
        id: 'comm-a',
        subject: 'Email A',
        senderEmail: 'recruiter@a.com',
        senderName: 'Recruiter A',
        companyName: 'Company A',
        receivedAt: '2026-10-08T12:00:00Z',
        date: '2026-10-08',
        body: 'Full body A',
        folder: 'Recruiters',
        isRead: false,
        detectedType: 'Interview Invitation',
        actionRequired: true,
      },
      {
        id: 'comm-b',
        subject: 'Email B',
        senderEmail: 'recruiter@b.com',
        senderName: 'Recruiter B',
        companyName: 'Company B',
        receivedAt: '2026-10-08T10:00:00Z',
        date: '2026-10-08',
        body: 'Full body B',
        folder: 'Recruiters',
        isRead: true,
        detectedType: 'HR Follow-up',
        actionRequired: false,
      },
    ];

    const sorted = sortCommunicationsNewestFirst(comms);
    expect(sorted.map((c) => c.id)).toEqual(['comm-a', 'comm-b', 'comm-c']);
  });
});

describe('Phase 031 Frontend Hardening — ApplicationReadinessCard (No Fabricated Fallbacks)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does NOT display fabricated 83% Fit Score or fabricated Greenhouse ATS provider', async () => {
    // Return null / 404 for readiness endpoints to simulate missing or delayed backend values
    vi.spyOn(jobsApi, 'getFitScore').mockRejectedValueOnce(new Error('Not found'));
    vi.spyOn(jobsApi, 'getApplicationReadiness').mockRejectedValueOnce(new Error('Not found'));
    vi.spyOn(jobsApi, 'getPolicyDecision').mockRejectedValueOnce(new Error('Not found'));

    const unverifiedJob: Job = {
      ...baseMockJob,
      applicationType: undefined,
      atsType: undefined,
      verificationStatus: 'UNKNOWN',
    };

    render(<ApplicationReadinessCard job={unverifiedJob} />);

    await waitFor(() => {
      // Must NOT display fabricated 83%
      expect(screen.queryByText(/FIT 83%/i)).toBeNull();
      // Must NOT display fabricated Greenhouse
      expect(screen.queryByText(/Greenhouse/i)).toBeNull();
    });

    // Displays clear unavailable / unverified state
    expect(screen.getByText(/Fit Score Unavailable/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Not verified \/ Unavailable/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays real Fit Score and real ATS provider from backend', async () => {
    vi.spyOn(jobsApi, 'getFitScore').mockResolvedValueOnce({
      overallScore: 94,
      components: [
        {
          name: 'Cloud & Kubernetes',
          weight: 0.5,
          score: 95,
          normalizedContribution: 47.5,
          matchedRequirements: ['Kubernetes'],
          partialMatches: [],
          gaps: [],
          notVerifiedItems: [],
          candidateEvidenceRefs: [],
          jobRequirementRefs: [],
          explanation: 'Matched',
        },
      ],
      requirementsMatrix: {},
      strongestMatches: [],
      gaps: [],
      notVerifiedEvidence: [],
      whyFits: 'Fits',
      whyNotApply: '',
      salaryDisplay: 'EUR 85,000 - 95,000',
      germanDisplay: 'None',
    });

    vi.spyOn(jobsApi, 'getApplicationReadiness').mockResolvedValueOnce({
      state: 'AUTO_APPLY_READY',
      readinessScore: 95,
      conditions: [
        {
          name: 'Apply Kit Grounding',
          passed: true,
          detail: 'Materials verified',
          isHardBlocker: true,
        },
      ],
      blockers: [],
      warnings: [],
      summary: 'Ready',
    });

    vi.spyOn(jobsApi, 'getPolicyDecision').mockResolvedValueOnce({
      decision: 'AUTO_APPLY',
      fitScore: {} as any,
      readinessState: {} as any,
      blockers: [],
      warnings: [],
      evidenceReferences: [],
      policyMode: 'CONTROLLED',
      evaluatedAt: '2026-10-08T12:00:00Z',
      realWorldJobIdentity: {} as any,
    });

    const realJob: Job = {
      ...baseMockJob,
      applicationType: 'Personio Direct' as any,
      atsType: 'personio',
      verificationStatus: 'VERIFIED',
    };

    render(<ApplicationReadinessCard job={realJob} />);

    await waitFor(() => {
      expect(screen.getByText(/FIT 94%/i)).toBeInTheDocument();
      expect(screen.getByText(/AUTO APPLY READY/i)).toBeInTheDocument();
      expect(screen.getByText(/personio/i)).toBeInTheDocument();
      expect(screen.getByText(/CV & Cover Letter READY/i)).toBeInTheDocument();
    });
  });
});

describe('Phase 031 Campaign Controls — CampaignDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValue(null as any);
  });

  it('renders disabled-by-default standby state and conservative limits', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValueOnce({
      date: '2026-10-08',
      isEnabled: false,
      emergencyStop: false,
      dailyLimit: 5,
      submittedToday: 0,
      remainingCapacity: 0,
      minFitScore: 85,
      minReadinessScore: 90,
      companyLimit: 1,
      atsLimit: 2,
      config: {
        dailyMaxApplications: 5,
        minFitScore: 85,
        minReadinessScore: 90,
        maxPerCompanyDaily: 1,
        maxPerAtsDaily: 2,
        cooldownSeconds: 60,
        isEnabled: false,
        emergencyStop: false,
      },
    });

    vi.spyOn(campaignApi, 'getRuns').mockResolvedValueOnce([]);

    render(<CampaignDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/CAMPAIGN STANDBY \(DISABLED\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Today's Cap/i)).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  it('renders emergency stop banner when emergency_stop is active', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValueOnce({
      date: '2026-10-08',
      isEnabled: false,
      emergencyStop: true,
      dailyLimit: 5,
      submittedToday: 0,
      remainingCapacity: 0,
      minFitScore: 85,
      minReadinessScore: 90,
      companyLimit: 1,
      atsLimit: 2,
      config: {
        dailyMaxApplications: 5,
        minFitScore: 85,
        minReadinessScore: 90,
        maxPerCompanyDaily: 1,
        maxPerAtsDaily: 2,
        cooldownSeconds: 60,
        isEnabled: false,
        emergencyStop: true,
      },
    });

    vi.spyOn(campaignApi, 'getRuns').mockResolvedValueOnce([]);

    render(<CampaignDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/EMERGENCY STOP ENGAGED/i)).toBeInTheDocument();
      expect(screen.getByText(/All autonomous candidate applications are locked and blocked/i)).toBeInTheDocument();
    });
  });
});
