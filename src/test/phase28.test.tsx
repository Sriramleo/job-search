import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ApplicationReadinessCard } from '../components/jobs/ApplicationReadinessCard';
import { Job } from '../types';
import { jobsApi } from '../api';

const mockJob: Job = {
  id: 'job-qual-test-001',
  title: 'Senior DevOps / Cloud Platform Engineer',
  companyId: 'comp-test',
  companyName: 'Test Corp',
  location: 'Berlin, Germany',
  jobUrl: 'https://testcorp.jobs.personio.de/job/12345',
  applicationUrl: 'https://testcorp.jobs.personio.de/job/12345',
  source: 'Personio Direct',
  sourceUrl: 'https://testcorp.jobs.personio.de/job/12345',
  postedDate: '2026-10-06',
  requirements: [],
  whyMatchesProfile: { title: 'Great Fit', points: [] },
  gaps: [],
  salaryMin: 85000,
  salaryMax: 100000,
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
  applicationType: 'External ATS',
  keySkills: ['Kubernetes', 'AWS', 'Terraform'],
  description: 'Senior DevOps Engineer role',
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
};

describe('Phase 028 Frontend — ApplicationReadinessCard & Policy Integration', () => {
  it('renders Fit % and AUTO APPLY READY state when all conditions pass', async () => {
    vi.spyOn(jobsApi, 'getFitScore').mockResolvedValueOnce({
      overallScore: 91,
      components: [
        {
          name: 'Role Alignment',
          weight: 0.25,
          score: 95,
          normalizedContribution: 23.75,
          matchedRequirements: ['DevOps'],
          partialMatches: [],
          gaps: [],
          notVerifiedItems: [],
          candidateEvidenceRefs: [],
          jobRequirementRefs: [],
          explanation: 'Matches target DevOps title.',
        },
      ],
      requirementsMatrix: {},
      strongestMatches: ['Role Alignment'],
      gaps: [],
      notVerifiedEvidence: [],
      whyFits: 'Strong alignment.',
      whyNotApply: '',
      salaryDisplay: '€85,000 - €100,000',
      germanDisplay: 'Not required',
    });

    vi.spyOn(jobsApi, 'getApplicationReadiness').mockResolvedValueOnce({
      state: 'AUTO_APPLY_READY',
      readinessScore: 100,
      conditions: [
        { name: 'Freshness Verification', passed: true, detail: 'VERIFIED', isHardBlocker: true },
        { name: 'Supported ATS', passed: true, detail: 'Personio', isHardBlocker: true },
      ],
      blockers: [],
      warnings: [],
      summary: 'All conditions passed.',
    });

    vi.spyOn(jobsApi, 'getPolicyDecision').mockResolvedValueOnce({
      decision: 'AUTO_APPLY',
      fitScore: {} as any,
      readinessState: {} as any,
      blockers: [],
      warnings: [],
      evidenceReferences: [],
      policyMode: 'CONTROLLED_PILOT_SINGLE_SUBMISSION',
      evaluatedAt: '2026-10-08T00:00:00Z',
      realWorldJobIdentity: {} as any,
    });

    render(<ApplicationReadinessCard job={mockJob} />);

    await waitFor(() => {
      expect(screen.getByText('FIT 91%')).toBeInTheDocument();
      expect(screen.getByText('AUTO APPLY READY')).toBeInTheDocument();
      expect(screen.getByText('AUTO APPLY')).toBeInTheDocument();
      expect(screen.getByText('VERIFIED')).toBeInTheDocument();
      expect(screen.getByText('CLEAR')).toBeInTheDocument();
    });
  });

  it('renders BLOCKED state and lists blockers when job is stale or unverified', async () => {
    const unverifiedJob: Job = {
      ...mockJob,
      verificationStatus: 'UNKNOWN',
    };

    vi.spyOn(jobsApi, 'getFitScore').mockResolvedValueOnce({
      overallScore: 82,
      components: [],
      requirementsMatrix: {},
      strongestMatches: [],
      gaps: [],
      notVerifiedEvidence: [],
      whyFits: '',
      whyNotApply: '',
      salaryDisplay: 'Not specified',
      germanDisplay: 'Not required',
    });

    vi.spyOn(jobsApi, 'getApplicationReadiness').mockResolvedValueOnce({
      state: 'BLOCKED',
      readinessScore: 75,
      conditions: [
        { name: 'Freshness Verification', passed: false, detail: 'Not verified', isHardBlocker: true },
      ],
      blockers: ['Posting freshness is not VERIFIED (current: UNKNOWN)'],
      warnings: [],
      summary: 'Submission blocked by freshness check.',
    });

    vi.spyOn(jobsApi, 'getPolicyDecision').mockResolvedValueOnce({
      decision: 'BLOCKED',
      fitScore: {} as any,
      readinessState: {} as any,
      blockers: ['Posting freshness is not VERIFIED (current: UNKNOWN)'],
      warnings: [],
      evidenceReferences: [],
      policyMode: 'CONTROLLED_PILOT_SINGLE_SUBMISSION',
      evaluatedAt: '2026-10-08T00:00:00Z',
      realWorldJobIdentity: {} as any,
    });

    render(<ApplicationReadinessCard job={unverifiedJob} />);

    await waitFor(() => {
      expect(screen.getAllByText(/BLOCKED/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Posting freshness is not VERIFIED/i)).toBeInTheDocument();
    });
  });

  it('renders ALREADY APPLIED state when real-world duplicate is detected', async () => {
    vi.spyOn(jobsApi, 'getFitScore').mockResolvedValueOnce({
      overallScore: 83,
      components: [],
      requirementsMatrix: {},
      strongestMatches: [],
      gaps: [],
      notVerifiedEvidence: [],
      whyFits: '',
      whyNotApply: '',
      salaryDisplay: 'Not specified',
      germanDisplay: 'Not required',
    });

    vi.spyOn(jobsApi, 'getApplicationReadiness').mockResolvedValueOnce({
      state: 'ALREADY_APPLIED',
      readinessScore: 90,
      conditions: [
        { name: 'Duplicate Check', passed: false, detail: 'Matches historical Personio submission', isHardBlocker: true },
      ],
      blockers: ['Existing application matches provider job ID 2687727.'],
      warnings: [],
      summary: 'Job is already applied.',
    });

    vi.spyOn(jobsApi, 'getPolicyDecision').mockResolvedValueOnce({
      decision: 'ALREADY_APPLIED',
      fitScore: {} as any,
      readinessState: {} as any,
      blockers: ['Existing application matches provider job ID 2687727.'],
      warnings: [],
      evidenceReferences: [],
      policyMode: 'CONTROLLED_PILOT_SINGLE_SUBMISSION',
      evaluatedAt: '2026-10-08T00:00:00Z',
      realWorldJobIdentity: {} as any,
    });

    render(<ApplicationReadinessCard job={mockJob} />);

    await waitFor(() => {
      expect(screen.getAllByText(/ALREADY APPLIED/i).length).toBeGreaterThan(0);
    });
  });
});
