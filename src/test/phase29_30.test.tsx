import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ApplicationReadinessCard } from '../components/jobs/ApplicationReadinessCard';
import { Job } from '../types';
import { jobsApi } from '../api';

const mockJob: Job = {
  id: 'job-wandelbots-cloud-sim-2797384',
  title: 'System Software Engineer (gn) Cloud & Simulation',
  companyId: 'comp-wandelbots',
  companyName: 'Wandelbots GmbH',
  location: 'Dresden, Germany',
  jobUrl: 'https://wandelbots.jobs.personio.de/job/2797384',
  applicationUrl: 'https://wandelbots.jobs.personio.de/job/2797384/apply',
  source: 'Personio Direct',
  sourceUrl: 'https://wandelbots.jobs.personio.de/job/2797384',
  postedDate: '2026-10-08',
  requirements: [],
  whyMatchesProfile: { title: 'Great Fit', points: [] },
  gaps: [],
  salaryMin: 80000,
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
  applicationType: 'External ATS',
  keySkills: ['Kubernetes', 'Cloud Infrastructure', 'Linux'],
  description: 'System Software Engineer Cloud & Simulation role',
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

describe('Phase 029/030 Frontend — Controlled Real Auto-Apply Pilot Verification', () => {
  it('renders verified positive ATS confirmation invariant banner', async () => {
    vi.spyOn(jobsApi, 'getFitScore').mockResolvedValueOnce({
      overallScore: 91,
      components: [
        {
          name: 'Technical Skills',
          weight: 0.25,
          score: 100,
          normalizedContribution: 25,
          matchedRequirements: ['Kubernetes', 'Cloud Infrastructure'],
          partialMatches: [],
          gaps: [],
          notVerifiedItems: [],
          candidateEvidenceRefs: [],
          jobRequirementRefs: [],
          explanation: 'Technical skills matched.',
        },
      ],
      strongestMatches: ['Technical Skills'],
      gaps: [],
      notVerifiedEvidence: [],
      whyFits: 'Strong skills match in Kubernetes and Cloud infrastructure.',
      whyNotApply: 'No hard gaps.',
      salaryDisplay: '€80,000 - €95,000',
      germanDisplay: 'English (Working Language)',
      requirementsMatrix: {},
    });

    vi.spyOn(jobsApi, 'getApplicationReadiness').mockResolvedValueOnce({
      state: 'AUTO_APPLY_READY',
      readinessScore: 100,
      conditions: [
        { name: 'Duplicate Check', passed: true, detail: 'No duplicate.', isHardBlocker: true },
        { name: 'Supported ATS', passed: true, detail: 'Personio supported.', isHardBlocker: true },
      ],
      blockers: [],
      warnings: [],
      summary: 'All conditions met.',
    });

    vi.spyOn(jobsApi, 'getPolicyDecision').mockResolvedValueOnce({
      decision: 'AUTO_APPLY',
      fitScore: {} as any,
      readinessState: {} as any,
      blockers: [],
      warnings: [],
      evidenceReferences: [],
      policyMode: 'CONTROLLED_PILOT_ONLY',
      evaluatedAt: '2026-10-08T13:30:00Z',
      realWorldJobIdentity: {
        providerJobId: '2797384',
        canonicalApplicationUrl: 'https://wandelbots.jobs.personio.de/job/2797384/apply',
        canonicalJobUrl: 'https://wandelbots.jobs.personio.de/job/2797384',
        normalizedCompany: 'Wandelbots GmbH',
        normalizedRole: 'System Software Engineer',
        providerOrAts: 'personio',
        sourceAppearances: ['personio'],
        identityHash: 'hash-wandelbots-2797384',
      },
    });

    render(<ApplicationReadinessCard job={mockJob} />);

    await waitFor(() => {
      expect(screen.getByText('FIT 91%')).toBeInTheDocument();
      expect(screen.getByText('AUTO APPLY READY')).toBeInTheDocument();
      expect(screen.getByText(/Positive employer ATS confirmation required before marking Applied/i)).toBeInTheDocument();
      expect(screen.getByText('Phase 029/030 Gate')).toBeInTheDocument();
    });
  });
});
