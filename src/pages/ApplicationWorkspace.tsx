import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building,
  Save,
  Send,
  Eye,
  Sparkles,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import { applicationsApi, jobsApi, candidateApi, documentsApi } from '../api';
import {
  Application,
  Job,
  Candidate,
  CandidateEvidence,
  Document,
  AutomationState,
  ApplicationClaim,
} from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { FitBadge, AutomationBadge, Badge, ClaimBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ValidationChecklist } from '../components/applications/ValidationChecklist';
import { LoadingSkeleton, ErrorState } from '../components/ui/FeedbackStates';

export const ApplicationWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Selected application ID (defaults to zalando application)
  const appId = id || 'app-zalando-01';

  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candidateEvidence, setCandidateEvidence] = useState<CandidateEvidence[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [claims, setClaims] = useState<ApplicationClaim[]>([]);
  const [activeTab, setActiveTab] = useState<'cv' | 'coverLetter' | 'answers' | 'referral' | 'recruiter' | 'claims'>('coverLetter');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [submissionSuccessModal, setSubmissionSuccessModal] = useState(false);

  // Form states for in-workspace editing
  const [coverLetterText, setCoverLetterText] = useState('');
  const [referralText, setReferralText] = useState('');
  const [recruiterText, setRecruiterText] = useState('');
  const [answersList, setAnswersList] = useState<Application['answers']>([]);
  const [checklist, setChecklist] = useState<Application['validationChecklist']>({
    correctJob: true,
    correctCompany: true,
    correctCV: true,
    coverLetterReady: true,
    requiredQuestionsAnswered: true,
    workAuthorizationVerified: true,
    noticePeriodVerified: true,
    noFabricatedInfo: true,
    noMissingRequiredFields: true,
  });

  useEffect(() => {
    const loadWorkspace = async () => {
      setIsLoading(true);
      try {
        let app = await applicationsApi.getApplication(appId);
        if (!app) {
          // Fallback to first available application
          const allApps = await applicationsApi.getApplications();
          app = allApps[0];
        }
        if (app) {
          setApplication(app);
          setCoverLetterText(app.coverLetterContent);
          setReferralText(app.referralMessageDraft);
          setRecruiterText(app.recruiterMessageDraft);
          setAnswersList(app.answers);
          setChecklist(app.validationChecklist);
          setClaims(app.claims || []);

          const [foundJob, cand, candEv, docs] = await Promise.all([
            jobsApi.getJob(app.jobId),
            candidateApi.getCandidate(),
            candidateApi.getCandidateEvidence(),
            documentsApi.getDocuments(),
          ]);

          setJob(foundJob);
          setCandidate(cand);
          setCandidateEvidence(candEv);
          setDocuments(docs);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkspace();
  }, [appId]);

  const handleAttestClaim = async (claimId: string) => {
    if (!application) return;
    try {
      await applicationsApi.attestClaim(application.id, claimId, 'Attested by candidate from production logs');
    } catch (err) {
      console.warn('Backend attestClaim error:', err);
    }
    setClaims((prev) => {
      const nextClaims = prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'Verified' as const,
              flagReason: undefined,
              sourceEvidenceSummary: 'Attested by candidate from production logs',
            }
          : c
      );
      const remainingUnverified = nextClaims.filter(
        (c) => c.status === 'Needs Attestation / Flagged'
      ).length;
      if (remainingUnverified === 0 && application) {
        setApplication((curr) => (curr ? { ...curr, automationState: 'Ready' } : null));
      }
      return nextClaims;
    });
  };

  if (isLoading) {
    return <LoadingSkeleton lines={10} />;
  }

  if (!application || !job) {
    return (
      <ErrorState
        title="Application Workspace Unavailable"
        message="Could not load application workspace for this opportunity."
        onRetry={() => navigate('/applications')}
      />
    );
  }

  // Save current workspace state
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const updated = await applicationsApi.updateApplication(application.id, {
        coverLetterContent: coverLetterText,
        referralMessageDraft: referralText,
        recruiterMessageDraft: recruiterText,
        answers: answersList,
        validationChecklist: checklist,
      });
      setApplication(updated);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChecklistItem = (key: keyof Application['validationChecklist']) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAnswerChange = (answerId: string, newText: string) => {
    setAnswersList((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, answer: newText } : a))
    );
  };

  const unverifiedClaimsCount = claims.filter(
    (c) => c.status === 'Needs Attestation / Flagged'
  ).length;

  const allChecklistPass = Object.values(checklist).every(Boolean) && unverifiedClaimsCount === 0;

  const effectiveAutomationState: AutomationState =
    unverifiedClaimsCount > 0 && (application.automationState === 'Ready' || application.automationState === 'Submitted')
      ? 'Human Review'
      : application.automationState;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenSubmissionConfirm = () => {
    if (!allChecklistPass) {
      if (unverifiedClaimsCount > 0) {
        alert('Cannot submit: 1 claim requires candidate attestation. Please review flagged claims in the Claim Audit tab.');
      } else {
        alert('Please satisfy all pre-flight validation checklist items before submitting.');
      }
      return;
    }
    setSubmissionSuccessModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!application) return;
    setIsSubmitting(true);
    try {
      const updated = await applicationsApi.markSubmitted(application.id, {
        notes: 'Submitted manually by candidate in external ATS',
        submissionMethod: 'External ATS Career Portal',
        submittedAt: new Date().toISOString(),
      });
      setApplication(updated);
      setSubmissionSuccessModal(false);
      navigate('/applications');
    } catch (err: any) {
      alert(`Submission confirmation failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Applications', href: '/applications' },
          { label: `${job.companyName} (${job.title})` },
        ]}
        title={`${job.title} — Application Workspace`}
        subtitle={`${job.companyName} · ${job.location} · Route: ${application.route} · Target: €80K+ Relocation to Germany`}
        actions={
          <div className="flex items-center gap-3">
            <AutomationBadge state={effectiveAutomationState} />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              isLoading={isSaving}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Draft
            </Button>
            {saveToast && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        }
      />

      {/* THREE-COLUMN WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: LEFT - JOB CONTEXT (3 COLS) */}
        <div className="lg:col-span-3 space-y-4">
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Target Role Context
              </div>
            }
            padding="sm"
          >
            <div className="space-y-3 p-1 text-xs">
              <div>
                <span className="text-[#64748B] block text-[11px]">Position</span>
                <span className="font-bold text-[#0F172A] text-sm">{job.title}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Employer</span>
                <span className="font-semibold text-slate-800">{job.companyName}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Location & Mode</span>
                <span className="text-[#475569]">{job.location}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Salary Band</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  €{(job.salaryMin / 1000).toFixed(0)}K–€{(job.salaryMax / 1000).toFixed(0)}K
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Technical Match</span>
                <div className="mt-1">
                  <FitBadge fit={job.technicalFit} />
                </div>
              </div>
            </div>
          </Card>

          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Submission Protocol
              </div>
            }
            padding="sm"
          >
            <div className="space-y-3 p-1 text-xs">
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-900 block">
                    Recommended Route
                  </span>
                  <Badge variant="blue" size="sm">Evidence-Backed</Badge>
                </div>
                <span className="font-bold text-blue-950 text-xs block">
                  {job.applicationRoute}
                </span>
                <p className="text-[11px] text-blue-800 leading-normal">
                  {job.routeReason}
                </p>
                <div className="pt-2 border-t border-blue-200/60 text-[10px] text-blue-900 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Referral Status:</span>
                    <span className="font-semibold text-amber-700">Potential (Unverified)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Human Gate:</span>
                    <span className="font-medium text-emerald-700">Mandatory Verification</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Required Deliverables
                </span>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>CV Resume</span>
                    <span className="font-medium text-rose-600">Required</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cover Letter</span>
                    <span className="font-medium text-rose-600">Required</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary Expectation</span>
                    <span className="font-medium text-rose-600">Required</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Work Auth Verification</span>
                    <span className="font-medium text-rose-600">Required</span>
                  </div>
                  <div className="flex justify-between">
                    <span>German Language</span>
                    <span className="font-medium text-slate-400">Not Requested</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 2: CENTER - APPLICATION MATERIALS (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            {/* Materials Tabs Header */}
            <div className="p-3 border-b border-[#E2E8F0] bg-slate-50/80">
              <Tabs
                variant="pills"
                tabs={[
                  { id: 'coverLetter', label: 'Cover Letter', icon: <FileText className="w-3.5 h-3.5" /> },
                  { id: 'cv', label: 'CV Variant', icon: <FileText className="w-3.5 h-3.5" /> },
                  { id: 'answers', label: 'Questions & Answers', count: answersList.length },
                  { id: 'referral', label: 'Referral Msg' },
                  { id: 'recruiter', label: 'Recruiter Msg' },
                  { id: 'claims', label: 'Claim Audit', count: claims.length, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                ]}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
              />
            </div>

            {/* TAB 1: COVER LETTER EDITOR */}
            {activeTab === 'coverLetter' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Tailored Cover Letter
                    </h3>
                    <span className="text-[11px] text-[#64748B]">
                      {coverLetterText.split(/\s+/).filter(Boolean).length} words · Formatted for German ATS
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(coverLetterText);
                        alert('Cover letter copied to clipboard!');
                      }}
                      icon={<Copy className="w-3.5 h-3.5" />}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Claim Trace Summary Callout */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-blue-900 font-medium text-[11px]">
                      {claims.filter((c) => c.status === 'Verified' || c.status === 'Supported by Profile').length} claims verified against candidate evidence.
                      {claims.some((c) => c.status === 'Needs Attestation / Flagged') && (
                        <span className="text-amber-700 font-semibold ml-1">
                          (1 claim flagged for candidate attestation)
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('claims')}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline"
                  >
                    Inspect Claims →
                  </button>
                </div>

                <textarea
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                  rows={16}
                  className="w-full p-4 text-xs font-mono text-slate-800 bg-slate-50/40 border border-[#E2E8F0] rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 leading-relaxed transition-all"
                  placeholder="Draft your cover letter here..."
                />
              </div>
            )}

            {/* TAB 2: CV VARIANT PREVIEW */}
            {activeTab === 'cv' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Selected CV Variant
                    </h3>
                    <span className="text-[11px] text-[#64748B]">
                      {application.cvVariantName}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/documents')}
                  >
                    Switch Variant
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3 font-mono text-slate-800">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="font-bold text-sm block">Sriram Sugavanam</span>
                    <span className="text-slate-600">Senior DevOps Engineer · Chennai, India (Relocating to Germany)</span>
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Tailored Technical Focus:</strong>
                    <p className="leading-relaxed text-slate-700">
                      8 years architecting enterprise AWS and multi-tenant Kubernetes clusters. Lead experience establishing GitOps (ArgoCD), Terraform infrastructure as code, and 99.95% availability SLOs.
                    </p>
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Target Match Highlight:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li>Operated 150+ microservices on multi-tenant EKS with automated Helm charts</li>
                      <li>Reduced developer environment provisioning time by 60% with modular Terraform</li>
                      <li>Spearheaded DevOps platform guild and authored infrastructure RFC standards</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QUESTIONS & ANSWERS */}
            {activeTab === 'answers' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Application Form Answers
                    </h3>
                    <span className="text-[11px] text-[#64748B]">
                      Verified responses to mandatory employer questions
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {answersList.map((ans, idx) => (
                    <div
                      key={ans.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#0F172A] leading-snug">
                          {idx + 1}. {ans.question}
                        </span>
                        {ans.verifiedAgainstCandidateProfile && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ml-2">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <textarea
                        value={ans.answer}
                        onChange={(e) => handleAnswerChange(ans.id, e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: REFERRAL MESSAGE */}
            {activeTab === 'referral' && (
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Internal Referral Request Draft
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(referralText);
                      alert('Referral draft copied!');
                    }}
                    icon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-[#64748B]">
                  Send to internal connection (e.g. Dr. Florian Becker) on LinkedIn to request an ATS referral submission.
                </p>
                <textarea
                  value={referralText}
                  onChange={(e) => setReferralText(e.target.value)}
                  rows={8}
                  className="w-full p-3 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>
            )}

            {/* TAB 5: RECRUITER MESSAGE */}
            {activeTab === 'recruiter' && (
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Recruiter Direct Outreach
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(recruiterText);
                      alert('Recruiter message copied!');
                    }}
                    icon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-[#64748B]">
                  Send directly to the talent partner handling this opening.
                </p>
                <textarea
                  value={recruiterText}
                  onChange={(e) => setRecruiterText(e.target.value)}
                  rows={8}
                  className="w-full p-3 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>
            )}

            {/* TAB 6: CLAIM-LEVEL EVIDENCE AUDIT */}
            {activeTab === 'claims' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Claim-Level Evidence Inspector
                    </h3>
                    <span className="text-[11px] text-[#64748B]">
                      Every factual assertion in generated materials mapped to primary candidate evidence
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {claims.filter((c) => c.status === 'Verified').length} Verified
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {claims.filter((c) => c.status === 'Supported by Profile').length} Supported
                    </span>
                    {claims.some((c) => c.status === 'Needs Attestation / Flagged') && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {claims.filter((c) => c.status === 'Needs Attestation / Flagged').length} Flagged
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        claim.status === 'Needs Attestation / Flagged'
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-slate-50/70 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-white px-1.5 py-0.2 rounded border border-slate-200">
                              {claim.materialType === 'coverLetter' ? 'Cover Letter' : claim.materialType === 'cv' ? 'CV Variant' : 'Q&A Answer'}
                            </span>
                            <ClaimBadge status={claim.status} />
                          </div>
                          <blockquote className="font-medium text-slate-900 italic text-[11px] leading-relaxed pt-1">
                            "{claim.claimText}"
                          </blockquote>
                        </div>
                        {claim.status === 'Needs Attestation / Flagged' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAttestClaim(claim.id)}
                            icon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                            className="shrink-0 text-xs"
                          >
                            Attest
                          </Button>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                        {claim.status === 'Needs Attestation / Flagged' ? (
                          <div className="text-amber-800 bg-amber-100/70 p-2 rounded-lg flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Flag Reason:</strong> {claim.flagReason}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[#64748B] flex items-center justify-between">
                            <span>
                              <strong className="text-slate-700">Source:</strong> {claim.sourceEvidenceSummary}
                            </span>
                            {claim.sourceEvidenceId && (
                              <span className="text-[10px] text-blue-600 font-mono">
                                #{claim.sourceEvidenceId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: RIGHT - EVIDENCE & VALIDATION (3 COLS) */}
        <div className="lg:col-span-3 space-y-4">
          {/* VALIDATION CHECKLIST */}
          <ValidationChecklist
            checklist={checklist}
            onToggleItem={handleToggleChecklistItem}
            unverifiedClaimsCount={unverifiedClaimsCount}
            onInspectClaims={() => setActiveTab('claims')}
          />

          {/* CLAIM EVIDENCE AUDIT HEALTH */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                  Claim-Level Audit
                </span>
                <span
                  className="text-[11px] text-blue-600 font-semibold cursor-pointer"
                  onClick={() => setActiveTab('claims')}
                >
                  Inspect ({claims.length})
                </span>
              </div>
            }
            padding="sm"
          >
            <div className="space-y-1.5 p-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Verified by Evidence:</span>
                <span className="font-bold text-emerald-700">
                  {claims.filter((c) => c.status === 'Verified').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Supported by Profile:</span>
                <span className="font-bold text-blue-700">
                  {claims.filter((c) => c.status === 'Supported by Profile').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Needs Attestation:</span>
                <span
                  className={`font-bold ${
                    claims.some((c) => c.status === 'Needs Attestation / Flagged')
                      ? 'text-amber-700'
                      : 'text-slate-400'
                  }`}
                >
                  {claims.filter((c) => c.status === 'Needs Attestation / Flagged').length}
                </span>
              </div>
              {claims.some((c) => c.status === 'Needs Attestation / Flagged') && (
                <div className="mt-1 pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg flex items-center justify-between">
                  <span>1 unverified claim</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('claims')}
                    className="font-bold underline text-amber-900"
                  >
                    Attest →
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* CANDIDATE & COMPANY EVIDENCE SNIPPETS */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Candidate Evidence Backing
              </div>
            }
            padding="sm"
          >
            <div className="space-y-2 p-1 text-xs">
              {candidateEvidence.slice(0, 3).map((ce) => (
                <div key={ce.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-[#0F172A] block">{ce.skillOrCapability}</span>
                  <p className="text-[#64748B] text-[11px] mt-0.5 leading-normal">
                    {ce.evidenceSummary}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                    Metric: {ce.impactMetric}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (Sticky & Distinct Submit Treatment) */}
      <div className="sticky bottom-0 z-20 bg-white border-t border-[#E2E8F0] px-6 py-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl">
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>Ready for your review</span>
            <span>·</span>
            <span>Final submission requires your confirmation.</span>
          </div>
          <div>
            {allChecklistPass ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pre-Flight Complete: Ready for Human Confirmation
              </span>
            ) : unverifiedClaimsCount > 0 ? (
              <span className="text-amber-800 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> {unverifiedClaimsCount} claim attestation outstanding — review flagged claims in Claim Audit to enable submission
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Resolve validation checklist items to enable submission
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={handleSaveDraft} isLoading={isSaving}>
            Save Draft
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveTab('coverLetter')}
          >
            Review Materials
          </Button>

          {/* Submit button with separate visual treatment */}
          <Button
            variant="success"
            size="md"
            disabled={!allChecklistPass}
            onClick={handleOpenSubmissionConfirm}
            icon={<Send className="w-4 h-4" />}
            iconPosition="right"
            className="px-6 font-bold shadow-md ring-2 ring-emerald-600/20"
          >
            Confirm External Submission
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {submissionSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-[#0F172A]">
                Have you manually submitted this application?
              </h3>
              <p className="text-xs text-[#64748B]">
                In accordance with human safety invariants, the recruitment operating system never automatically submits applications. Please confirm you have completed external submission on the employer portal.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Job:</span>
                <span className="font-semibold text-slate-800">{job.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Company:</span>
                <span className="font-semibold text-slate-800">{job.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">External ATS:</span>
                <span className="font-semibold text-blue-700">{job.applicationRoute}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-1/2"
                onClick={() => setSubmissionSuccessModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                className="w-1/2 font-bold"
                onClick={handleConfirmSubmit}
                isLoading={isSubmitting}
              >
                Yes, I submitted it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
