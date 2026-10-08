import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CampaignDashboard } from '../components/campaign/CampaignDashboard';
import { campaignApi } from '../api';
import {
  CampaignConfig,
  CampaignDailyStatus,
  DailyCampaignReport,
  CampaignQueueEvaluationResult,
} from '../types';

const mockConfigStage0: CampaignConfig = {
  stage: 'STAGE_0_DRY_RUN',
  dailyMaxApplications: 1,
  minFitScore: 85,
  minReadinessScore: 90,
  maxPerCompanyDaily: 1,
  maxPerAtsDaily: 1,
  isEnabled: false,
  emergencyStop: false,
};

const mockStatusStage0: CampaignDailyStatus = {
  date: '2026-10-08',
  stage: 'STAGE_0_DRY_RUN',
  isEnabled: false,
  emergencyStop: false,
  dailyLimit: 1,
  submittedToday: 0,
  applicationsAttempted: 0,
  outcomeUnknownCount: 0,
  lockedSlots: 0,
  remainingCapacity: 1,
  minFitScore: 85,
  minReadinessScore: 90,
  companyLimit: 1,
  atsLimit: 1,
  config: mockConfigStage0,
};

const mockDailyReport: DailyCampaignReport = {
  campaignRunId: 'run-test-123',
  date: '2026-10-08',
  stage: 'STAGE_0_DRY_RUN',
  isEnabled: false,
  emergencyStop: false,
  discoveryCount: 42,
  qualifiedCount: 15,
  freshVerifiedCount: 8,
  eligibleAutoApplyCount: 3,
  skippedCount: 5,
  blockedCount: 4,
  manualReviewCount: 2,
  applicationsAttempted: 0,
  applicationsPositivelyConfirmed: 0,
  outcomeUnknownCount: 0,
  captchaMfaAuthBlocks: 0,
  dailyQuotaUsed: 0,
  dailyQuotaRemaining: 1,
  topEligibleCandidates: [
    {
      jobId: 'job-101',
      roleTitle: 'Senior Cloud Platform Engineer',
      companyName: 'Wandelbots GmbH',
      fitScore: 93,
      readinessState: 'AUTO_APPLY_READY',
      policyDecision: 'AUTO_APPLY',
      atsProvider: 'personio',
      freshnessStatus: 'VERIFIED',
      duplicateStatus: 'NOT_DUPLICATE',
      eligible: true,
      reasons: null,
    },
  ],
  generatedAt: '2026-10-08T12:00:00Z',
};

describe('Phase 032 — Controlled Daily Campaign Activation UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Stage 0 dry-run standby state and explicit activation controls', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValue(mockStatusStage0);
    vi.spyOn(campaignApi, 'getRuns').mockResolvedValue([]);
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValue(mockDailyReport);

    render(<CampaignDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/STAGE 0 DRY-RUN/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Arm 1-per-day Campaign')).toBeInTheDocument();
    expect(screen.getByText('Run Dry Run')).toBeInTheDocument();
    expect(screen.getByText('Emergency Stop')).toBeInTheDocument();
  });

  it('opens confirmation modal before arming Stage 1 campaign', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValue(mockStatusStage0);
    vi.spyOn(campaignApi, 'getRuns').mockResolvedValue([]);
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValue(mockDailyReport);
    const armSpy = vi.spyOn(campaignApi, 'armStage1').mockResolvedValue({
      ...mockConfigStage0,
      stage: 'STAGE_1_SINGLE_DAILY',
      isEnabled: true,
    });

    render(<CampaignDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/STAGE 0 DRY-RUN/i)).toBeInTheDocument();
    });


    // Click Arm 1-per-day Campaign button
    fireEvent.click(screen.getByText('Arm 1-per-day Campaign'));

    // Modal should now appear
    expect(screen.getByText('Confirm Stage 1 Campaign Arming')).toBeInTheDocument();
    expect(screen.getByText(/1 application per calendar day/)).toBeInTheDocument();

    // Confirm button inside modal
    const confirmBtn = screen.getByText('Confirm & Arm 1/day Campaign');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(armSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('displays Section 10 Daily Campaign Report with top candidate queue', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValue(mockStatusStage0);
    vi.spyOn(campaignApi, 'getRuns').mockResolvedValue([]);
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValue(mockDailyReport);

    render(<CampaignDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Daily Campaign Report/)).toBeInTheDocument();
    });

    expect(screen.getByText('Wandelbots GmbH')).toBeInTheDocument();
    expect(screen.getByText('Senior Cloud Platform Engineer')).toBeInTheDocument();
    expect(screen.getByText('93%')).toBeInTheDocument();
  });

  it('renders locked slots when ambiguous outcomes exist', async () => {
    const lockedStatus: CampaignDailyStatus = {
      ...mockStatusStage0,
      lockedSlots: 1,
      outcomeUnknownCount: 1,
      remainingCapacity: 0,
    };

    vi.spyOn(campaignApi, 'getStatus').mockResolvedValue(lockedStatus);
    vi.spyOn(campaignApi, 'getRuns').mockResolvedValue([]);
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValue(mockDailyReport);

    render(<CampaignDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Locked Slots')).toBeInTheDocument();
    });

    expect(screen.getByText('Unknown/unverified slots')).toBeInTheDocument();
  });
});
