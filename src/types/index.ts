// ==========================================
// Strict Data Contracts for Germany Job Hunt
// Phase 1: Frontend contracts ready for Phase 2 FastAPI Pydantic models
// ==========================================

export type FitLevel = 'Strong' | 'Good' | 'Moderate' | 'Weak';

export type EvidenceStatus =
  | 'Confirmed by Source'
  | 'Evidence Found'
  | 'Unknown'
  | 'Contradictory';

export type ApplicationRoute =
  | 'Referral'
  | 'Official Application'
  | 'Recruiter Outreach'
  | 'Referral + Official ATS'
  | 'Referral + ATS'
  | 'company_ats'
  | 'official_ats'
  | 'company_careers'
  | 'external_job_board'
  | 'linkedin'
  | 'manual_external'
  | 'unknown';

export type PipelineStage =
  | 'Discovered'
  | 'Qualified'
  | 'Preparing'
  | 'Ready'
  | 'Applied'
  | 'Recruiter Screen'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'Closed';

export type RequirementDemand = 'Required' | 'Optional' | 'Not Requested' | 'Unknown';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export type AutomationState =
  | 'AI Prepared'
  | 'Human Review'
  | 'Ready'
  | 'Ready for Review'
  | 'Approved for Fill'
  | 'Filling'
  | 'Filled'
  | 'Awaiting Human Submission'
  | 'Automation Running'
  | 'Submission Approved'
  | 'Submitting'
  | 'Submission Verified'
  | 'Submission Unverified'
  | 'Submission Requires Human Action'
  | 'Submission Failed'
  | 'Submitted'
  | 'Needs Attention';


export interface Candidate {
  id: string;
  name: string;
  currentRole: string; // Strictly "Senior DevOps Engineer"
  experienceYears: number;
  skills: string[];
  leadershipExperience: string;
  languages: { language: string; level: string }[];
  education: string;
  targetRoles: string[];
  targetCountry: string;
  targetMinimumSalary: number;
  blueCardObjective: boolean;
  germanLevel: string; // "A1"
  email: string;
  location: string;
}

export interface CandidateEvidence {
  id: string;
  skillOrCapability: string;
  evidenceSummary: string;
  impactMetric: string;
  verifiedInProjects: string[];
}

export interface JobRequirement {
  id: string;
  category: 'Cloud' | 'Kubernetes' | 'IaC' | 'Observability' | 'CI/CD' | 'Language' | 'Leadership';
  title: string;
  levelRequired: string;
  candidateEvidence: string;
  fit: FitLevel;
  gapType?: 'Missing' | 'Transferable' | 'Unknown';
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string; // e.g. "Berlin", "Munich", "Frankfurt"
  workModel: 'Hybrid' | 'Office' | 'Remote';
  seniority: 'Senior' | 'Lead' | 'Principal' | 'Staff';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  technicalFit: FitLevel;
  seniorLeadFit: FitLevel;
  salaryFit: FitLevel;
  applicationReadiness: FitLevel;
  relocationStatus: EvidenceStatus;
  relocationSummary: string;
  germanRequirement: 'None' | 'A1/A2 Preferred' | 'B1+' | 'Fluent';
  applicationRoute: ApplicationRoute;
  routeReason: string;
  status: PipelineStage;
  postedDate: string;
  source: string; // e.g., "LinkedIn", "StepStone.de", "Company Career Site"
  sourceUrl: string;
  applicationUrl?: string;
  url?: string;
  keySkills: string[];
  description: string;
  whyMatchesProfile: {
    title: string;
    points: string[];
  };
  requirements: JobRequirement[];
  gaps: {
    skill: string;
    type: 'Missing' | 'Transferable' | 'Unknown';
    mitigationStrategy: string;
  }[];
  applicationRequirements: {
    cv: RequirementDemand;
    coverLetter: RequirementDemand;
    portfolio: RequirementDemand;
    salaryQuestion: RequirementDemand;
    noticePeriod: RequirementDemand;
    workAuthorization: RequirementDemand;
    germanRequirement: RequirementDemand;
  };
  timeline: {
    stage: string;
    date: string;
    notes?: string;
  }[];
}

export interface CompanyEvidence {
  id: string;
  claim: string;
  status: EvidenceStatus;
  source: string;
  sourceUrl: string;
  capturedDate: string;
  excerpt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  headquarters: string;
  germanyLocations: string[];
  size: '50-200' | '200-1000' | '1000-5000' | '5000+';
  engineeringContext: string;
  technologySignals: string[];
  internationalHiringEvidence: EvidenceStatus;
  relocationEvidence: EvidenceStatus;
  workAuthorizationEvidence: EvidenceStatus;
  evidenceList: CompanyEvidence[];
  openRolesCount: number;
  activeApplicationsCount: number;
  website: string;
}

export type ContactRelationship =
  | 'Recruiter'
  | 'Hiring Manager'
  | 'Potential Referral'
  | 'Former Colleague'
  | 'Engineering Lead';

export interface Contact {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  role: string;
  relationship: ContactRelationship;
  source: string;
  linkedJobId?: string;
  linkedJobTitle?: string;
  linkedInUrl: string;
  email?: string;
  lastContactDate?: string;
  nextAction?: string;
  nextActionDueDate?: string;
  notes: string;
  messages: {
    id: string;
    date: string;
    type: 'LinkedIn' | 'Email';
    direction: 'Inbound' | 'Outbound';
    subject?: string;
    body: string;
  }[];
}

export interface ApplicationAnswer {
  id: string;
  question: string;
  answer: string;
  verifiedAgainstCandidateProfile: boolean;
  required: boolean;
}

export type ClaimVerificationStatus =
  | 'Verified'
  | 'Supported by Profile'
  | 'Needs Attestation / Flagged';

export interface ApplicationClaim {
  id: string;
  claimText: string;
  materialType: 'coverLetter' | 'cv' | 'answer';
  sourceEvidenceId?: string;
  sourceEvidenceSummary?: string;
  status: ClaimVerificationStatus;
  flagReason?: string;
  confidenceScore?: 'High' | 'Medium' | 'Low';
}

export interface StatutoryImmigrationParameter {
  id: string;
  criterion: string;
  legalBasis: string;
  status: EvidenceStatus;
  source: string;
  verificationDate: string;
  verificationNotes: string;
  candidateEvidenceSummary: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  providerType: 'gemini' | 'claude' | 'openai' | 'local_ollama' | 'mock_engine';
  selectedModel: string;
  availableModels: string[];
  purpose: string;
  enabled: boolean;
  temperature: number;
  maxTokens: number;
  status: 'Connected' | 'Standby' | 'Configured';
  customEndpoint?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  location: string;
  salaryRange: string;
  stage: PipelineStage;
  route: ApplicationRoute;
  applicationUrl?: string;
  automationState: AutomationState;
  appliedDate?: string;
  updatedDate: string;
  nextAction: string;
  nextActionDueDate: string;
  cvVariantId: string;
  cvVariantName: string;
  coverLetterContent: string;
  answers: ApplicationAnswer[];
  referralMessageDraft: string;
  recruiterMessageDraft: string;
  claims?: ApplicationClaim[];
  validationChecklist: {
    correctJob: boolean;
    correctCompany: boolean;
    correctCV: boolean;
    coverLetterReady: boolean;
    requiredQuestionsAnswered: boolean;
    workAuthorizationVerified: boolean;
    noticePeriodVerified: boolean;
    noFabricatedInfo: boolean;
    noMissingRequiredFields: boolean;
  };
  submittedAt?: string;
  submissionConfirmationId?: string;
  submissionNotes?: string;
  submissionMethod?: string;
  automationSessionId?: string;
  applicationVersion?: string;
  lastAutomationRunId?: string;
  lastSubmissionAttemptAt?: string;
  lastSubmissionStatus?: string;
  lastSubmissionError?: string;
  lastSubmissionErrorCode?: string;
  retryPolicy?: 'SAFE_TO_RETRY' | 'DO_NOT_AUTO_RETRY' | 'OUTCOME_UNKNOWN' | string;
}

export interface SubmissionResult {
  applicationId: string;
  status: 'applied' | 'submission_unverified' | 'submission_requires_human_action' | 'submission_failed';
  verified: boolean;
  submittedAt?: string;
  confirmationId?: string;
  confirmationMessage?: string;
  errorMessage?: string;
  errorCode?: string;
  automationRunId?: string;
  retryPolicy?: 'SAFE_TO_RETRY' | 'DO_NOT_AUTO_RETRY' | 'OUTCOME_UNKNOWN' | string;
  humanActionRequired?: boolean;
  auditEvents?: string[];
}

export interface ApproveAndSubmitRequest {
  applicationId?: string;
  sessionId?: string;
  jobId: string;
  companyId: string;
  cvVariantId: string;
  coverLetterId?: string;
  applicationVersion?: string;
  approvedBy?: string;
  confirmationAcknowledged: boolean;
  notes?: string;
}


export interface Document {
  id: string;
  title: string;
  type: 'Master CV' | 'CV Variant' | 'Cover Letter' | 'Application Answers';
  linkedJobId?: string;
  linkedJobTitle?: string;
  linkedCompany?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  tags: string[];
  sourceEvidenceReferences?: {
    evidenceId: string;
    claim: string;
    source: string;
  }[];
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  round: string; // e.g., "Screening", "System Design", "Kubernetes Deep Dive", "Managerial"
  scheduledDate: string;
  durationMinutes: number;
  interviewerName: string;
  interviewerRole: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Awaiting Feedback';
  interviewType: 'Video Call' | 'Technical Pairing' | 'System Architecture Review';
  technicalTopics: string[];
  systemDesignTopics: string[];
  keyQuestionsPrepared: string[];
  preparationNotes: string;
  feedback?: string;
  nextStep?: string;
}

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
  status: TaskStatus;
  actionType:
    | 'Review CV'
    | 'Send Recruiter Email'
    | 'Send LinkedIn Message'
    | 'Submit Application'
    | 'Prepare Interview'
    | 'Review Application'
    | 'Follow Up';
  description?: string;
}

export interface ResearchEvidence {
  id: string;
  category:
    | 'Job Evidence'
    | 'Company Evidence'
    | 'Relocation Evidence'
    | 'Work Authorization Evidence'
    | 'Candidate Evidence';
  claim: string;
  status: EvidenceStatus;
  source: string;
  url: string;
  capturedDate: string;
  confidenceScore: 'High' | 'Medium' | 'Low';
  originalExcerpt: string;
  usedIn: string; // e.g. "Application #APP-102", "Zalando Lead Role"
}

export interface Communication {
  id: string;
  senderName: string;
  senderEmail: string;
  companyName: string;
  folder: 'All' | 'Recruiters' | 'HR' | 'Referrals' | 'Applications' | 'Interviews' | 'Other';
  subject: string;
  linkedJobId?: string;
  linkedJobTitle?: string;
  linkedApplicationId?: string;
  date: string;
  detectedType:
    | 'Recruiter Outreach'
    | 'HR Follow-up'
    | 'Interview Invitation'
    | 'Application Acknowledgment'
    | 'Referral Update'
    | 'Offer'
    | 'Rejection';
  actionRequired: boolean;
  actionSummary?: string;
  body: string;
  suggestedResponse?: string;
  isRead: boolean;
}

export interface AutomationRun {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  frequency: string;
  nextRun: string;
  lastRun: string;
  lastStatus: 'Success' | 'Failed' | 'Running' | 'Idle';
}

export interface AIUsage {
  provider: 'Jev' | 'Gemini' | 'Apify';
  modelOrTask: string;
  requestsThisMonth: number;
  tokensOrUnits: number;
  costEstimateEur: number;
}
