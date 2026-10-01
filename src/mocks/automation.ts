import { AutomationRun, AIUsage } from '../types';

export const mockAutomationRuns: AutomationRun[] = [
  {
    id: 'auto-01',
    name: 'Job Discovery Crawler',
    description: 'Scans target German career portals (Zalando, N26, Personio, Celonis, StepStone.de) for new Senior/Lead DevOps, Cloud, and Kubernetes postings.',
    enabled: true,
    frequency: 'Every 6 hours',
    nextRun: 'Today at 22:00 CET',
    lastRun: 'Today at 16:00 CET',
    lastStatus: 'Success',
  },
  {
    id: 'auto-02',
    name: 'Job Matching & Qualification Engine',
    description: 'Evaluates newly discovered job specifications against Sriram Sugavanam’s verified skills, salary requirements (€80K+), and relocation feasibility.',
    enabled: true,
    frequency: 'Every 6 hours',
    nextRun: 'Today at 22:30 CET',
    lastRun: 'Today at 16:30 CET',
    lastStatus: 'Success',
  },
  {
    id: 'auto-03',
    name: 'Company & Relocation Evidence Harvester',
    description: 'Extracts official evidence excerpts regarding German visa sponsorship, English-speaking culture, and engineering context from employer career sites.',
    enabled: true,
    frequency: 'Daily at 02:00 CET',
    nextRun: 'Tomorrow at 02:00 CET',
    lastRun: 'Yesterday at 02:00 CET',
    lastStatus: 'Success',
  },
  {
    id: 'auto-04',
    name: 'Application Material Preparation Agent',
    description: 'Generates tailored CV variant drafts, cover letters, and verified answers for qualified high-fit opportunities awaiting human review.',
    enabled: true,
    frequency: 'On-demand / Triggered',
    nextRun: 'Pending human trigger',
    lastRun: '2026-09-30 at 14:22 CET',
    lastStatus: 'Success',
  },
  {
    id: 'auto-05',
    name: 'Follow-up & Communication Monitor',
    description: 'Scans linked recruitment communications for interview invitations, recruiter inquiries, and due follow-ups.',
    enabled: true,
    frequency: 'Hourly',
    nextRun: 'In 35 minutes',
    lastRun: '25 minutes ago',
    lastStatus: 'Success',
  },
];

export const mockAIUsage: AIUsage[] = [
  {
    provider: 'Jev',
    modelOrTask: 'Job Qualification & Fit Reasoning',
    requestsThisMonth: 142,
    tokensOrUnits: 384000,
    costEstimateEur: 2.15,
  },
  {
    provider: 'Gemini',
    modelOrTask: 'Gemini 1.5 Pro — Tailored Document Synthesis & Cover Letters',
    requestsThisMonth: 86,
    tokensOrUnits: 512000,
    costEstimateEur: 3.40,
  },
  {
    provider: 'Apify',
    modelOrTask: 'German Career Portal & StepStone.de Scraper Actors',
    requestsThisMonth: 48,
    tokensOrUnits: 480,
    costEstimateEur: 8.50,
  },
];

export const mockAnalyticsData = {
  applicationFunnel: [
    { stage: 'Discovered', count: 48, percentage: 100 },
    { stage: 'Qualified', count: 42, percentage: 87.5 },
    { stage: 'Preparing', count: 6, percentage: 12.5 },
    { stage: 'Applied', count: 18, percentage: 37.5 },
    { stage: 'Recruiter Screen', count: 5, percentage: 10.4 },
    { stage: 'Interview', count: 3, percentage: 6.2 },
    { stage: 'Offer', count: 0, percentage: 0 },
  ],
  sourceAnalysis: [
    { source: 'Company Career Sites', count: 18, qualifiedRate: '88%' },
    { source: 'LinkedIn Inbound', count: 12, qualifiedRate: '92%' },
    { source: 'Referrals (CNCF / Alumni)', count: 8, qualifiedRate: '100%' },
    { source: 'StepStone.de', count: 10, qualifiedRate: '70%' },
  ],
  roleDistribution: [
    { role: 'Senior DevOps / SRE', count: 16 },
    { role: 'Lead Platform Engineer', count: 12 },
    { role: 'Cloud Infrastructure Architect', count: 8 },
    { role: 'Kubernetes Specialist', count: 6 },
  ],
  salaryDistribution: [
    { band: '€80K–€90K', count: 9 },
    { band: '€90K–€100K', count: 18 },
    { band: '€100K–€115K', count: 12 },
    { band: '€115K+', count: 3 },
  ],
  cityBreakdown: [
    { city: 'Berlin', qualifiedCount: 18 },
    { city: 'Munich', qualifiedCount: 12 },
    { city: 'Hamburg', qualifiedCount: 5 },
    { city: 'Frankfurt', qualifiedCount: 4 },
    { city: 'Other Germany', qualifiedCount: 3 },
  ],
};
