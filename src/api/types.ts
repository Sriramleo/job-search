/**
 * API Contract Types and Zod Validation Schemas for Germany Job Hunt.
 */

import { z } from 'zod';
export * from '../types';

// ==========================================
// Zod Runtime Validation Schemas
// ==========================================

export const FitLevelSchema = z.enum(['Strong', 'Good', 'Moderate', 'Weak']);

export const EvidenceStatusSchema = z.enum([
  'Confirmed by Source',
  'Evidence Found',
  'Unknown',
  'Contradictory',
]);

export const PipelineStageSchema = z.enum([
  'Discovered',
  'Qualified',
  'Preparing',
  'Ready',
  'Applied',
  'Recruiter Screen',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
  'Closed',
  'Review',
  'Submitted',
]);

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  companyId: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  location: z.string().default('Germany'),
  workModel: z.string().default('Hybrid'),
  seniority: z.string().default('Senior'),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().default('EUR'),
  technicalFit: z.string().default('Strong'),
  status: z.string().default('Qualified'),
  applicationUrl: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

export const ApplicationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  companyId: z.string(),
  stage: z.string(),
  automationState: z.string().nullable().optional(),
  route: z.string().default('Official Application'),
  atsPlatform: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  submittedAt: z.string().optional().nullable(),
});

// Phase 10 Analytics Schemas
export const OverviewMetricsSchema = z.object({
  totalDiscoveredJobs: z.number().default(0),
  totalNormalizedJobs: z.number().default(0),
  totalQualifiedJobs: z.number().default(0),
  totalRejectedJobs: z.number().default(0),
  totalApplications: z.number().default(0),
  applicationsAwaitingReview: z.number().default(0),
  applicationsSubmitted: z.number().default(0),
  activeApplications: z.number().default(0),
  interviews: z.number().default(0),
  offers: z.number().default(0),
  referrals: z.number().default(0),
  recruiterConversations: z.number().default(0),
  pendingTasks: z.number().default(0),
  overdueTasks: z.number().default(0),
  unreadCommunicationCount: z.number().default(0),
  jobsDiscoveredToday: z.number().default(0),
  jobsQualifiedToday: z.number().default(0),
  applicationsCreatedToday: z.number().default(0),
  applicationsSubmittedToday: z.number().default(0),
  interviewsScheduled: z.number().default(0),
  activeAutomationRuns: z.number().default(0),
  failedAutomationRuns: z.number().default(0),
  lastSuccessfulGmailSync: z.string().nullable().optional(),
  lastSuccessfulDiscoveryRun: z.string().nullable().optional(),
  lastSuccessfulQualificationRun: z.string().nullable().optional(),
  lastSuccessfulAgentRun: z.string().nullable().optional(),
});

export type OverviewMetrics = z.infer<typeof OverviewMetricsSchema>;

export interface JobFunnelStage {
  stage: string;
  count: number;
  conversionRate: number | null;
}

export interface JobFunnelResponse {
  window: string;
  startDate?: string | null;
  endDate?: string | null;
  stages: JobFunnelStage[];
  overallConversionRate: number | null;
}

export interface ApplicationFunnelStage {
  stage: string;
  count: number;
  conversionRate: number | null;
  medianDurationHours?: number | null;
  avgDurationHours?: number | null;
}

export interface ApplicationFunnelResponse {
  totalApplications: number;
  staleItemsCount: number;
  stages: ApplicationFunnelStage[];
}

export interface ApplicationPerformanceResponse {
  applicationsPerWeek: number;
  applicationsPerMonth: number;
  submissionRate: number | null;
  responseRate: number | null;
  recruiterResponseRate: number | null;
  interviewRate: number | null;
  offerCount: number;
  rejectionCount: number;
  withdrawalCount: number;
  avgTimeToSubmitHours: number | null;
  avgTimeToRecruiterResponseHours: number | null;
  avgTimeToInterviewHours: number | null;
  applicationsAwaitingHumanAction: number;
  bySource: Record<string, number>;
  byCompany: Record<string, number>;
  byRoleFamily: Record<string, number>;
  byLocation: Record<string, number>;
  bySeniority: Record<string, number>;
  byWorkModel: Record<string, number>;
  byReferralVsDirect: Record<string, number>;
  byApplicationRoute: Record<string, number>;
  byAts: Record<string, number>;
}

export interface CommunicationAnalyticsResponse {
  contactsDiscovered: number;
  contactsVerified: number;
  potentialReferralContacts: number;
  outreachDrafts: number;
  outreachPrepared: number;
  readyForHumanSend: number;
  manuallyMarkedSent: number;
  replies: number;
  followUpsDue: number;
  followUpsCompleted: number;
  referralAgreed: number;
  referralDeclined: number;
  recruiterResponse: number;
  noResponseAgingDaysAvg: number | null;
  channels: Record<string, any>;
}

export interface GmailAnalyticsResponse {
  totalSyncedMessages: number;
  inboundMessages: number;
  outboundMessages: number;
  matchedMessages: number;
  unmatchedMessages: number;
  manuallyAssociatedMessages: number;
  recruiterMessages: number;
  applicationRelatedMessages: number;
  referralRelatedMessages: number;
  lastSuccessfulSync?: string | null;
  avgSyncDurationSeconds?: number | null;
  syncFailures: number;
  historyTokenRecoveryEvents: number;
}

export interface AICostResponse {
  provider: string;
  model: string;
  operations: string[];
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  executionCount: number;
  successfulExecutions: number;
  failedExecutions: number;
  partialExecutions: number;
  estimatedCost: number | null;
  actualCost: number | null;
  avgCostPerOperation: number | null;
  dailyCost: number | null;
  weeklyCost: number | null;
  monthlyCost: number | null;
  costByModel: Record<string, number>;
  costByOperation: Record<string, number>;
  costByWorkflow: Record<string, number>;
  agentToolCalls: number;
  agentTurns: number;
  avgAgentTurns: number | null;
  maxAgentTurns: number;
  timeoutCount: number;
  costLimitTerminationCount: number;
}

export interface CostAnomaly {
  type: string;
  runId?: string | null;
  reason: string;
  observedValue: number;
  threshold: number;
  detectedAt: string;
}

export interface AIAnomaliesResponse {
  totalAnomalies: number;
  anomalies: CostAnomaly[];
}

export interface OrchestrationHealthResponse {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  partialRuns: number;
  skippedRuns: number;
  averageDurationSeconds: number | null;
  medianDurationSeconds: number | null;
  maximumDurationSeconds: number | null;
  retries: number;
  lockConflicts: number;
  staleLockRecoveries: number;
  idempotencySkips: number;
  workflowLevelFailures: number;
  breakdownByWorkflow: Record<string, any>;
  lastExecutionTimestamp?: string | null;
}

export interface DataQualityIssue {
  category: string;
  severity: string;
  entityType: string;
  entityId: string;
  description: string;
  detectedAt: string;
}

export interface DataQualityReport {
  totalIssues: number;
  issuesByCategory: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issues: DataQualityIssue[];
}

export interface AlertRecord {
  alertType: string;
  severity: string;
  status: string;
  firstDetectedAt: string;
  lastDetectedAt: string;
  affectedCount: number;
  description: string;
}

export interface AlertsReport {
  totalAlerts: number;
  activeAlertsCount: number;
  alerts: AlertRecord[];
}

export interface DailyOperationsSummary {
  jobsDiscovered: number;
  jobsQualified: number;
  applicationsPrepared: number;
  applicationsAwaitingReview: number;
  applicationsSubmitted: number;
  recruiterResponses: number;
  referralResponses: number;
  interviews: number;
  pendingTasks: number;
  overdueTasks: number;
  aiUsageCount: number;
  aiEstimatedCost: number | null;
  workflowFailures: number;
  gmailSyncStatus: string;
  agentStatus: string;
  itemsRequiringHumanAttention: number;
}

export interface HumanActionItem {
  priority: string;
  type: string;
  entity: string;
  entityId: string;
  title: string;
  reason: string;
  createdAt: string;
  dueAt?: string | null;
  source?: string | null;
}

export interface HumanActionQueue {
  totalItems: number;
  highPriorityCount: number;
  items: HumanActionItem[];
}

export interface CostSummaryResponse {
  aiGeminiCost: number | null;
  jevCost: number | null;
  apifyCost: number | null;
  gcpBilling: string;
  totalEstimatedCost: number | null;
  breakdown: Record<string, any>;
}

export interface SystemHealthResponse {
  status: string;
  database: string;
  gmail: string;
  ai: string;
  orchestration: string;
  configuration: string;
  timestamp: string;
}
