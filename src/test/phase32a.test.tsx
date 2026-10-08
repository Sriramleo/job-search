import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CampaignDashboard } from '../components/campaign/CampaignDashboard';
import { campaignApi } from '../api';

vi.mock('../api', () => ({
  campaignApi: {
    getStatus: vi.fn(),
    getRuns: vi.fn(),
    getDailyReport: vi.fn(),
    evaluateQueue: vi.fn(),
    armStage1: vi.fn(),
    setStage0DryRun: vi.fn(),
    emergencyStop: vi.fn(),
    updateConfig: vi.fn(),
    executeCycle: vi.fn(),
  },
}));

describe('Phase 032A — Durable Campaign Quota Transition & Reporting UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reconciled Stage 1 authoritative quota (cap=1, confirmed=1, remaining=0, no stale 4)', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValueOnce({
      date: '2026-10-08',
      stage: 'STAGE_1_SINGLE_DAILY',
      isEnabled: true,
      emergencyStop: false,
      dailyLimit: 1,
      submittedToday: 1,
      existingConfirmedToday: 1,
      campaignSubmissionsAttempted: 0,
      campaignSubmissionsConfirmed: 0,
      applicationsAttempted: 1,
      outcomeUnknownCount: 0,
      lockedSlots: 0,
      remainingCapacity: 0,
      minFitScore: 85,
      minReadinessScore: 90,
      companyLimit: 1,
      atsLimit: 1,
      config: {
        stage: 'STAGE_1_SINGLE_DAILY',
        dailyMaxApplications: 1,
        minFitScore: 85,
        minReadinessScore: 90,
        maxPerCompanyDaily: 1,
        maxPerAtsDaily: 1,
        cooldownSeconds: 60,
        isEnabled: true,
        emergencyStop: false,
      },
    });

    vi.spyOn(campaignApi, 'getRuns').mockResolvedValueOnce([]);
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValueOnce({
      campaignRunId: 'run-123',
      date: '2026-10-08',
      stage: 'STAGE_1_SINGLE_DAILY',
      isEnabled: true,
      emergencyStop: false,
      discoveryCount: 15,
      qualifiedCount: 4,
      freshVerifiedCount: 3,
      eligibleAutoApplyCount: 0,
      skippedCount: 1,
      blockedCount: 0,
      manualReviewCount: 0,
      existingConfirmedToday: 1,
      campaignSubmissionsAttempted: 0,
      campaignSubmissionsConfirmed: 0,
      applicationsAttempted: 1,
      applicationsPositivelyConfirmed: 1,
      outcomeUnknownCount: 0,
      captchaMfaAuthBlocks: 0,
      dailyQuotaUsed: 1,
      dailyQuotaRemaining: 0,
      topEligibleCandidates: [],
      generatedAt: '2026-10-08T12:00:00Z',
    });

    render(<CampaignDashboard />);

    await waitFor(() => {
      // Must show Stage 1 armed
      expect(screen.getByText(/STAGE 1: 1-PER-DAY CAMPAIGN ARMED/i)).toBeInTheDocument();
      // Must show Remaining quota 0
      expect(screen.getByText(/Remaining quota: 0/i)).toBeInTheDocument();
      // Breakdown shows 1 existing, 0 campaign
      expect(screen.getByText(/1 existing, 0 campaign/i)).toBeInTheDocument();
      // Must show Daily Quota Remaining 0
      expect(screen.getByText(/Daily Quota Remaining/i)).toBeInTheDocument();
      // Must NOT display stale remaining 4
      expect(screen.queryByText(/Remaining quota: 4/i)).not.toBeInTheDocument();
    });
  });

  it('renders daily report distinguishing existing applications from campaign submissions', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValueOnce({
      date: '2026-10-08',
      stage: 'STAGE_0_DRY_RUN',
      isEnabled: false,
      emergencyStop: false,
      dailyLimit: 1,
      submittedToday: 1,
      existingConfirmedToday: 1,
      campaignSubmissionsAttempted: 0,
      campaignSubmissionsConfirmed: 0,
      remainingCapacity: 0,
      minFitScore: 85,
      minReadinessScore: 90,
      companyLimit: 1,
      atsLimit: 1,
      config: {
        stage: 'STAGE_0_DRY_RUN',
        dailyMaxApplications: 1,
        minFitScore: 85,
        minReadinessScore: 90,
        maxPerCompanyDaily: 1,
        maxPerAtsDaily: 1,
        isEnabled: false,
        emergencyStop: false,
      },
    });

    vi.spyOn(campaignApi, 'getRuns').mockResolvedValueOnce([]);
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValueOnce({
      campaignRunId: 'run-stage0-dryrun',
      date: '2026-10-08',
      stage: 'STAGE_0_DRY_RUN',
      isEnabled: false,
      emergencyStop: false,
      discoveryCount: 15,
      qualifiedCount: 4,
      freshVerifiedCount: 3,
      eligibleAutoApplyCount: 0,
      skippedCount: 1,
      blockedCount: 0,
      manualReviewCount: 0,
      existingConfirmedToday: 1,
      campaignSubmissionsAttempted: 0,
      campaignSubmissionsConfirmed: 0,
      applicationsAttempted: 1,
      applicationsPositivelyConfirmed: 1,
      outcomeUnknownCount: 0,
      captchaMfaAuthBlocks: 0,
      dailyQuotaUsed: 1,
      dailyQuotaRemaining: 0,
      topEligibleCandidates: [],
      generatedAt: '2026-10-08T12:00:00Z',
    });

    render(<CampaignDashboard />);

    await waitFor(() => {
      // Must show Stage 0 Dry-run banner
      expect(screen.getByText(/CAMPAIGN STANDBY \(DISABLED\) — STAGE 0 DRY-RUN/i)).toBeInTheDocument();
      // Must show explicit Section 8 labels
      expect(screen.getByText(/Existing Confirmed Today/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Submissions Attempted/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Submissions Confirmed/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily Quota Used/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily Quota Remaining/i)).toBeInTheDocument();
    });
  });

  it('renders locked slots when outcome unknown occurs', async () => {
    vi.spyOn(campaignApi, 'getStatus').mockResolvedValueOnce({
      date: '2026-10-08',
      stage: 'STAGE_1_SINGLE_DAILY',
      isEnabled: true,
      emergencyStop: false,
      dailyLimit: 1,
      submittedToday: 0,
      lockedSlots: 1,
      outcomeUnknownCount: 1,
      remainingCapacity: 0,
      minFitScore: 85,
      minReadinessScore: 90,
      companyLimit: 1,
      atsLimit: 1,
      config: {
        stage: 'STAGE_1_SINGLE_DAILY',
        dailyMaxApplications: 1,
        minFitScore: 85,
        minReadinessScore: 90,
        maxPerCompanyDaily: 1,
        maxPerAtsDaily: 1,
        isEnabled: true,
        emergencyStop: false,
      },
    });

    vi.spyOn(campaignApi, 'getRuns').mockResolvedValueOnce([]);
    vi.spyOn(campaignApi, 'getDailyReport').mockResolvedValueOnce({
      campaignRunId: 'run-locked',
      date: '2026-10-08',
      stage: 'STAGE_1_SINGLE_DAILY',
      isEnabled: true,
      emergencyStop: false,
      discoveryCount: 15,
      qualifiedCount: 4,
      freshVerifiedCount: 3,
      eligibleAutoApplyCount: 0,
      skippedCount: 1,
      blockedCount: 0,
      manualReviewCount: 0,
      existingConfirmedToday: 0,
      campaignSubmissionsAttempted: 1,
      campaignSubmissionsConfirmed: 0,
      applicationsAttempted: 1,
      applicationsPositivelyConfirmed: 0,
      outcomeUnknownCount: 1,
      captchaMfaAuthBlocks: 0,
      dailyQuotaUsed: 1,
      dailyQuotaRemaining: 0,
      topEligibleCandidates: [],
      generatedAt: '2026-10-08T12:00:00Z',
    });

    render(<CampaignDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Locked Slots/i)).toBeInTheDocument();
      expect(screen.getByText(/Outcome Unknown \/ Locked/i)).toBeInTheDocument();
    });
  });
});
