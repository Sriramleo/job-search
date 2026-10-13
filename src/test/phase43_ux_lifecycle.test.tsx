import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FitBadge } from '../components/ui/Badge';
import { JobTable } from '../components/jobs/JobTable';
import { JobPreviewDrawer } from '../components/jobs/JobPreviewDrawer';
import { Job } from '../types';

describe('Phase 043: UX, Application Lifecycle & Discovery Improvements', () => {
  describe('FitBadge percentage & legacy evaluation handling', () => {
    it('renders grounded percentage score when score is provided', () => {
      render(<FitBadge score={85} />);
      expect(screen.getByText('85% Fit')).toBeInTheDocument();
    });

    it('renders Not evaluated when score is null/undefined and no fit provided', () => {
      render(<FitBadge score={null} />);
      expect(screen.getByText('Not evaluated')).toBeInTheDocument();
    });

    it('falls back to categorical label when only fit is provided', () => {
      render(<FitBadge fit="Strong" />);
      expect(screen.getByText('Strong Fit')).toBeInTheDocument();
    });
  });

  describe('JobTable without routing controls', () => {
    const mockJob: Job = {
      id: 'job-1',
      title: 'Senior DevOps Engineer',
      companyId: 'comp-1',
      companyName: 'TechCorp GmbH',
      location: 'Berlin, Germany',
      workModel: 'Hybrid',
      seniority: 'Senior',
      salaryMin: 85000,
      salaryMax: 95000,
      salaryCurrency: 'EUR',
      technicalFit: 'Strong',
      seniorLeadFit: 'Good',
      salaryFit: 'Strong',
      applicationReadiness: 'Good',
      fitScore: 92,
      relocationStatus: 'Confirmed by Source',
      relocationSummary: 'Visa sponsorship confirmed',
      germanRequirement: 'None',
      applicationRoute: 'Official Application',
      routeReason: 'Direct ATS vacancy',
      status: 'Qualified',
      postedDate: '2026-10-10T10:00:00Z',
      source: 'Company Careers',
      sourceUrl: 'https://techcorp.de/careers/1',
      keySkills: ['AWS', 'Kubernetes', 'Terraform'],
      description: 'Role description',
      whyMatchesProfile: { title: 'Great match', points: ['Point 1'] },
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
    };

    it('renders Fit Score column header and does not render Application Route header', () => {
      render(
        <BrowserRouter>
          <JobTable
            jobs={[mockJob]}
            onSelectJobForPreview={vi.fn()}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Fit Score')).toBeInTheDocument();
      expect(screen.queryByText('Application Route')).not.toBeInTheDocument();
      expect(screen.getByText('92% Fit')).toBeInTheDocument();
    });
  });

  describe('JobPreviewDrawer without recommended route card', () => {
    const mockJob: Job = {
      id: 'job-1',
      title: 'Platform Engineer',
      companyId: 'comp-1',
      companyName: 'CloudCorp',
      location: 'Munich, Germany',
      workModel: 'Remote',
      seniority: 'Senior',
      salaryMin: 90000,
      salaryMax: 105000,
      salaryCurrency: 'EUR',
      technicalFit: 'Strong',
      seniorLeadFit: 'Good',
      salaryFit: 'Strong',
      applicationReadiness: 'Good',
      fitScore: 88,
      relocationStatus: 'Evidence Found',
      relocationSummary: 'Relocation assistance noted',
      germanRequirement: 'None',
      applicationRoute: 'company_ats',
      routeReason: 'Direct ATS',
      status: 'Qualified',
      postedDate: '2026-10-10T10:00:00Z',
      source: 'Workday',
      sourceUrl: 'https://cloudcorp.wd3.myworkdayjobs.com/1',
      applicationUrl: 'https://cloudcorp.wd3.myworkdayjobs.com/1',
      atsType: 'Workday',
      keySkills: ['Kubernetes', 'Go'],
      description: 'Platform engineering role',
      whyMatchesProfile: { title: 'Direct alignment', points: ['Deep k8s focus'] },
      requirements: [],
      gaps: [],
      applicationRequirements: {
        cv: 'Required',
        coverLetter: 'Not Requested',
        portfolio: 'Not Requested',
        salaryQuestion: 'Optional',
        noticePeriod: 'Optional',
        workAuthorization: 'Required',
        germanRequirement: 'Not Requested',
      },
      timeline: [],
    };

    it('renders Fit Score and does not render Recommended Application Route card', () => {
      render(
        <BrowserRouter>
          <JobPreviewDrawer
            job={mockJob}
            isOpen={true}
            onClose={vi.fn()}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('88% Fit')).toBeInTheDocument();
      expect(screen.queryByText('Recommended Application Route')).not.toBeInTheDocument();
    });
  });
});
