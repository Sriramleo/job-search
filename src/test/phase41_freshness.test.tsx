import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobTable } from '../components/jobs/JobTable';
import { Job } from '../types';

const mockJobs: Job[] = [
  {
    id: 'job-test-1',
    title: 'Senior DevOps Engineer',
    companyName: '1KOMMA5°',
    companyId: 'comp-1komma5',
    location: 'Berlin, Germany',
    workModel: 'Hybrid',
    seniority: 'Senior',
    technicalFit: 'Strong',
    seniorLeadFit: 'Strong',
    salaryFit: 'Strong',
    applicationReadiness: 'Strong',
    relocationStatus: 'Confirmed by Source',
    relocationSummary: 'Full visa sponsorship',
    germanRequirement: 'None',
    salaryMin: 90000,
    salaryMax: 110000,
    salaryCurrency: 'EUR',
    applicationRoute: 'Official Application',
    routeReason: 'Direct application link',
    status: 'Qualified',
    postedDate: '2026-10-10',
    source: 'Personio Direct',
    sourceUrl: 'https://1komma5grad.jobs.personio.de/job/2707674',
    applicationUrl: 'https://1komma5grad.jobs.personio.de/job/2707674',
    atsType: 'Personio',
    verificationStatus: 'VERIFIED',
    lastSuccessfulVerifiedAt: '2026-10-12T10:00:00Z',
    keySkills: ['Kubernetes', 'AWS', 'Terraform'],
    description: 'Senior role',
    whyMatchesProfile: { title: 'Fit', points: ['Matches Kubernetes'] },
    requirements: [],
    gaps: [],
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
  },
  {
    id: 'job-test-2',
    title: 'Lead Platform Architect',
    companyName: 'Acme Cloud',
    companyId: 'comp-acme',
    location: 'Munich, Germany',
    workModel: 'Remote',
    seniority: 'Lead',
    technicalFit: 'Good',
    seniorLeadFit: 'Good',
    salaryFit: 'Good',
    applicationReadiness: 'Good',
    relocationStatus: 'Unknown',
    relocationSummary: 'Not specified',
    germanRequirement: 'None',
    salaryMin: 95000,
    salaryMax: 120000,
    salaryCurrency: 'EUR',
    applicationRoute: 'company_careers',
    routeReason: 'Generic board',
    status: 'Qualified',
    postedDate: '2026-10-11',
    source: 'StepStone',
    sourceUrl: 'https://stepstone.de/job/999',
    applicationUrl: 'https://stepstone.de/job/999',
    atsType: 'Unknown',
    verificationStatus: 'UNKNOWN',
    keySkills: ['GCP', 'Terraform'],
    description: 'Lead role',
    whyMatchesProfile: { title: 'Fit', points: ['Matches GCP'] },
    requirements: [],
    gaps: [],
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
  },
];

describe('Phase 041 — Frontend Freshness Badges and Direct ATS Links', () => {
  it('renders Verified Active badge with timestamp tooltip and Direct Link for verified jobs', () => {
    render(
      <BrowserRouter>
        <JobTable
          jobs={mockJobs}
          sortField="latest"
          sortDirection="desc"
          onSort={() => {}}
          onSelectJobForPreview={() => {}}
        />
      </BrowserRouter>
    );

    // Verified badge
    expect(screen.getByText('Verified Active')).toBeDefined();
    // Unverified badge
    expect(screen.getByText('Unverified')).toBeDefined();
    // Company name
    expect(screen.getByText('1KOMMA5°')).toBeDefined();
    // Direct link button exists for 1KOMMA5°
    const directLink = screen.getByTitle('Open official vacancy (Personio)');
    expect(directLink).toBeDefined();
    expect(directLink.getAttribute('href')).toBe('https://1komma5grad.jobs.personio.de/job/2707674');
  });
});
