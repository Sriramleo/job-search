import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobTable } from '../components/jobs/JobTable';
import { Job } from '../types';

const phase42SampleJobs: Job[] = [
  {
    id: 'job-qual-job_disc_89044cd4192e',
    title: 'Senior Site Reliability Engineer - Access Team',
    companyName: 'N26',
    companyId: 'comp-n26',
    location: 'Berlin, Germany',
    workModel: 'Hybrid',
    seniority: 'Senior',
    technicalFit: 'Strong',
    seniorLeadFit: 'Strong',
    salaryFit: 'Strong',
    applicationReadiness: 'Strong',
    relocationStatus: 'Confirmed by Source',
    relocationSummary: 'Visa sponsorship available',
    germanRequirement: 'None',
    salaryMin: 95000,
    salaryMax: 115000,
    salaryCurrency: 'EUR',
    applicationRoute: 'official_ats',
    routeReason: 'Direct ATS Greenhouse link',
    status: 'Qualified',
    postedDate: '2026-10-10',
    source: 'Greenhouse',
    sourceUrl: 'https://job-boards.greenhouse.io/embed/job_app?for=n26&token=7768035',
    applicationUrl: 'https://job-boards.greenhouse.io/embed/job_app?for=n26&token=7768035',
    atsType: 'Greenhouse',
    verificationStatus: 'VERIFIED',
    lastSuccessfulVerifiedAt: '2026-10-13T12:54:00Z',
    keySkills: ['Kubernetes', 'AWS', 'Terraform', 'Go'],
    description: 'Senior SRE role',
    whyMatchesProfile: { title: 'Fit', points: ['Matches Kubernetes and SRE experience'] },
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
    id: 'job-qual-job_disc_164bc32f4e5b',
    title: '(Senior) Software Engineer - Device Connectivity (Go)',
    companyName: '1KOMMA5°',
    companyId: 'comp-1komma5',
    location: 'Berlin, Germany (Remote)',
    workModel: 'Remote',
    seniority: 'Senior',
    technicalFit: 'Strong',
    seniorLeadFit: 'Good',
    salaryFit: 'Strong',
    applicationReadiness: 'Strong',
    relocationStatus: 'Evidence Found',
    relocationSummary: 'Remote in Germany',
    germanRequirement: 'None',
    salaryMin: 85000,
    salaryMax: 105000,
    salaryCurrency: 'EUR',
    applicationRoute: 'official_ats',
    routeReason: 'Direct Personio ATS',
    status: 'Qualified',
    postedDate: '2026-10-10',
    source: 'Personio',
    sourceUrl: 'https://1komma5grad.jobs.personio.de/job/2707674',
    applicationUrl: 'https://1komma5grad.jobs.personio.de/job/2707674',
    atsType: 'Personio',
    verificationStatus: 'VERIFIED',
    lastSuccessfulVerifiedAt: '2026-10-13T12:54:10Z',
    keySkills: ['Go', 'Cloud', 'IoT', 'Docker'],
    description: 'Senior Device Connectivity',
    whyMatchesProfile: { title: 'Fit', points: ['Go and container experience'] },
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
    id: 'job-hellofresh-01',
    title: 'Lead Cloud Infrastructure Architect',
    companyName: 'HelloFresh',
    companyId: 'comp-hellofresh',
    location: 'Berlin · Hybrid',
    workModel: 'Hybrid',
    seniority: 'Lead',
    technicalFit: 'Good',
    seniorLeadFit: 'Good',
    salaryFit: 'Good',
    applicationReadiness: 'Good',
    relocationStatus: 'Unknown',
    relocationSummary: 'Not specified',
    germanRequirement: 'None',
    salaryMin: 100000,
    salaryMax: 130000,
    salaryCurrency: 'EUR',
    applicationRoute: 'company_careers',
    routeReason: 'Company website',
    status: 'Qualified',
    postedDate: '2026-10-11',
    source: 'Company Website',
    sourceUrl: 'https://careers.hellofresh.com/lead-infra',
    applicationUrl: 'https://careers.hellofresh.com/lead-infra',
    atsType: 'Unknown',
    verificationStatus: 'UNKNOWN',
    keySkills: ['AWS', 'Kubernetes'],
    description: 'Lead architect',
    whyMatchesProfile: { title: 'Fit', points: ['Cloud architecture'] },
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

describe('Phase 042 — Bounded Freshness Recovery Frontend Verification', () => {
  it('renders verified active badges and correct direct ATS external links for recovered roles', () => {
    render(
      <BrowserRouter>
        <JobTable
          jobs={phase42SampleJobs}
          sortField="latest"
          sortDirection="desc"
          onSort={() => {}}
          onSelectJobForPreview={() => {}}
        />
      </BrowserRouter>
    );

    // 2 jobs are Verified Active
    const verifiedBadges = screen.getAllByText('Verified Active');
    expect(verifiedBadges.length).toBe(2);

    // 1 job is Unverified
    expect(screen.getByText('Unverified')).toBeDefined();

    // Verify company names are present
    expect(screen.getByText('N26')).toBeDefined();
    expect(screen.getByText('1KOMMA5°')).toBeDefined();
    expect(screen.getByText('HelloFresh')).toBeDefined();

    // Direct links to Greenhouse and Personio exist
    const ghLink = screen.getByTitle('Open official vacancy (Greenhouse)');
    expect(ghLink).toBeDefined();
    expect(ghLink.getAttribute('href')).toBe('https://job-boards.greenhouse.io/embed/job_app?for=n26&token=7768035');

    const personioLink = screen.getByTitle('Open official vacancy (Personio)');
    expect(personioLink).toBeDefined();
    expect(personioLink.getAttribute('href')).toBe('https://1komma5grad.jobs.personio.de/job/2707674');
  });
});
