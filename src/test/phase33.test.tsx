import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { OutcomeIntelligenceSection } from '../components/applications/OutcomeIntelligenceSection';
import { OutcomeAnalyticsCard } from '../components/analytics/OutcomeAnalyticsCard';
import { analyticsApi, applicationsApi } from '../api';
import { ApplicationOutcomeDetail, OutcomeAnalyticsResponse } from '../types';

vi.mock('../api', () => ({
  analyticsApi: {
    getOutcomeAnalytics: vi.fn(),
  },
  applicationsApi: {
    syncOutcomes: vi.fn(),
    getApplicationOutcome: vi.fn(),
    getApplicationTimeline: vi.fn(),
  },
}));

describe('Phase 033 — Application Outcome Intelligence UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOutcomeDetail: ApplicationOutcomeDetail = {
    applicationId: 'app-qual-job_disc_106c01565135',
    jobId: 'job_disc_106c01565135',
    companyName: '1KOMMA5°',
    jobTitle: 'Cloud / DevOps Engineer',
    submissionStatus: 'SUBMITTED',
    outcomeState: 'APPLICATION_RECEIVED',
    rejectionReason: null,
    confidence: 'HIGH',
    firstResponseAt: '2026-10-05T04:33:00Z',
    latestResponseAt: '2026-10-05T04:33:00Z',
    latestMessageId: 'gmsg_1a10a5c2a92dee54',
    latestSubject: 'Eingangsbestätigung deiner Bewerbung bei 1KOMMA5°',
    latestSender: 'jobs@1komma5grad.com',
    evidenceSnippet: 'Vielen Dank für Ihre Bewerbung',
    classifierVersion: 'v1.0-deterministic',
    nextRecommendedAction: 'No immediate action required. Waiting for employer review.',
    responseTimeMetrics: {
      submissionToFirstResponseHours: 1.5,
      submissionToRejectionDays: null,
      submissionToInterviewDays: null,
      submissionToAssessmentDays: null,
      submissionToOfferDays: null,
    },
    timeline: [
      {
        id: 'evt-2',
        applicationId: 'app-qual-job_disc_106c01565135',
        eventType: 'CONFIRMATION',
        title: 'Application Receipt Confirmed',
        description: 'Received application confirmation email from 1KOMMA5°',
        timestamp: '2026-10-05T04:33:00Z',
        source: 'GMAIL_SYNC',
        evidenceSnippet: 'Eingangsbestätigung deiner Bewerbung bei 1KOMMA5°',
      },
      {
        id: 'evt-1',
        applicationId: 'app-qual-job_disc_106c01565135',
        eventType: 'SUBMISSION',
        title: 'Application Submitted',
        description: 'Submitted application to 1KOMMA5° via Personio ATS',
        timestamp: '2026-10-05T04:31:39Z',
        source: 'APPLICATION_ENGINE',
      },
    ],
  };

  it('renders outcome state badge, response metrics, and chronological timeline in OutcomeIntelligenceSection', () => {
    render(<OutcomeIntelligenceSection outcome={mockOutcomeDetail} />);

    // Outcome badge
    expect(screen.getByText('Receipt Confirmed')).toBeInTheDocument();

    // Duration metric
    expect(screen.getByText(/1.5 hours to first reply/i)).toBeInTheDocument();

    // Next attention guidance
    expect(screen.getByText(/Waiting for employer review/i)).toBeInTheDocument();

    // Timeline events
    expect(screen.getByText('Application Receipt Confirmed')).toBeInTheDocument();
    expect(screen.getByText(/Received application confirmation email from 1KOMMA5°/i)).toBeInTheDocument();
    expect(screen.getByText('Application Submitted')).toBeInTheDocument();
    expect(screen.getByText(/Submitted application to 1KOMMA5° via Personio ATS/i)).toBeInTheDocument();
  });

  it('renders grounded rejection intelligence when application is rejected with specific requirement reason', () => {
    const rejectedOutcome: ApplicationOutcomeDetail = {
      ...mockOutcomeDetail,
      outcomeState: 'REJECTION',
      rejectionReason: 'SPECIFIC_REQUIREMENT_REJECTION',
      evidenceSnippet: 'Leider müssen wir dir mitteilen, dass wir C1 Deutschkenntnisse zwingend voraussetzen.',
      nextRecommendedAction: 'Log rejection feedback and evaluate German requirement filter.',
      responseTimeMetrics: {
        submissionToFirstResponseHours: 2.0,
        submissionToRejectionDays: 3.5,
        submissionToInterviewDays: null,
        submissionToAssessmentDays: null,
        submissionToOfferDays: null,
      },
    };

    render(<OutcomeIntelligenceSection outcome={rejectedOutcome} />);

    expect(screen.getByText('Application Rejected')).toBeInTheDocument();
    expect(screen.getByText(/Specific Requirement Stated/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Leider müssen wir dir mitteilen, dass wir C1 Deutschkenntnisse zwingend voraussetzen/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3.5 days to rejection/i)).toBeInTheDocument();
  });

  it('renders OutcomeAnalyticsCard with funnel, response times, sample sizes, and observational disclaimer', async () => {
    const mockAnalyticsResponse: OutcomeAnalyticsResponse = {
      totalApplications: 17,
      totalSubmitted: 2,
      totalConfirmed: 2,
      outcomesSummary: {
        OFFER: 0,
        INTERVIEW_SCHEDULED: 0,
        INTERVIEW_INVITATION: 0,
        ASSESSMENT: 0,
        APPLICATION_RECEIVED: 2,
        RECRUITER_RESPONSE: 0,
        REJECTION: 0,
        NO_RESPONSE: 15,
        UNKNOWN: 0,
      },
      conversionRates: {
        responseRatePercent: 11.8,
        interviewRatePercent: 0.0,
        offerRatePercent: 0.0,
        rejectionRatePercent: 0.0,
      },
      averageResponseTimes: {
        submissionToFirstResponseHours: 1.5,
        submissionToRejectionDays: null,
        submissionToInterviewDays: null,
        submissionToAssessmentDays: null,
        submissionToOfferDays: null,
      },
      medianResponseTimes: {
        submissionToFirstResponseHours: 1.5,
        submissionToRejectionDays: null,
        submissionToInterviewDays: null,
        submissionToAssessmentDays: null,
        submissionToOfferDays: null,
      },
      fitBandAnalysis: [
        {
          band: '90-100',
          sampleCount: 2,
          applicationsCount: 2,
          noResponseCount: 0,
          recruiterResponseCount: 0,
          assessmentCount: 0,
          interviewCount: 0,
          rejectionCount: 0,
          offerCount: 0,
          interviewRate: 0.0,
          rejectionRate: 0.0,
        },
        {
          band: '85-89',
          sampleCount: 15,
          applicationsCount: 15,
          noResponseCount: 15,
          recruiterResponseCount: 0,
          assessmentCount: 0,
          interviewCount: 0,
          rejectionCount: 0,
          offerCount: 0,
          interviewRate: 0.0,
          rejectionRate: 0.0,
        },
      ],
      atsComparison: [
        {
          dimensionValue: 'Personio',
          sampleCount: 2,
          applicationsCount: 2,
          interviewCount: 0,
          rejectionCount: 0,
          interviewRate: 0.0,
          rejectionRate: 0.0,
        },
      ],
      germanRequirementComparison: [
        {
          dimensionValue: 'Not Required / B1',
          sampleCount: 2,
          applicationsCount: 2,
          interviewCount: 0,
          rejectionCount: 0,
          interviewRate: 0.0,
          rejectionRate: 0.0,
        },
      ],
      sourceComparison: [],
      disclaimer:
        'Observational analytics only. Fit score weights and campaign limits are not modified from outcome data.',
      generatedAt: '2026-10-08T12:00:00Z',
    };

    vi.spyOn(analyticsApi, 'getOutcomeAnalytics').mockResolvedValue(mockAnalyticsResponse);

    render(<OutcomeAnalyticsCard />);

    // Wait for card to finish loading
    await waitFor(() => {
      expect(screen.getByText('Post-Application Outcome Intelligence')).toBeInTheDocument();
    });

    // Total count
    expect(screen.getByText(/across 17 applications and linked email responses/i)).toBeInTheDocument();
    // Response time average & median (both are 1.5h in mock)
    const hoursElements = screen.getAllByText('1.5h');
    expect(hoursElements.length).toBeGreaterThanOrEqual(1);
    // Fit band sample sizes
    expect(screen.getByText('90-100%')).toBeInTheDocument();
    expect(screen.getAllByText('N = 2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('85-89%')).toBeInTheDocument();
    expect(screen.getByText('N = 15')).toBeInTheDocument();
    // ATS breakdown
    expect(screen.getByText('Personio')).toBeInTheDocument();
    // Observational disclaimer
    expect(
      screen.getByText(/Observational analytics only\. Fit score weights and campaign limits are not modified/i)
    ).toBeInTheDocument();
  });
});
