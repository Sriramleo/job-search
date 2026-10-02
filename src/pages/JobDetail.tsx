import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Bookmark,
  Share2,
} from 'lucide-react';
import { jobsApi, companiesApi, contactsApi } from '../api';
import { Job, Company, Contact } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { FitBadge, EvidenceBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton, ErrorState } from '../components/ui/FeedbackStates';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const foundJob = await jobsApi.getJob(id);
        if (foundJob) {
          setJob(foundJob);
          const [compData, contactsData] = await Promise.all([
            companiesApi.getCompany(foundJob.companyId),
            contactsApi.getContacts(),
          ]);
          setCompany(compData);
          setContacts(contactsData.filter((c) => c.companyId === foundJob.companyId || c.linkedJobId === foundJob.id));
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  if (isLoading) {
    return <LoadingSkeleton lines={10} />;
  }

  if (!job) {
    return (
      <ErrorState
        title="Job Not Found"
        message="The requested job opportunity could not be retrieved from the active index."
        onRetry={() => navigate('/jobs')}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Context Actions */}
      <PageHeader
        breadcrumbs={[
          { label: 'Jobs', href: '/jobs' },
          { label: job.companyName, href: `/companies/${job.companyId}` },
          { label: job.title },
        ]}
        title={job.title}
        subtitle={`${job.companyName} · ${job.location} · ${
          job.salaryMin && job.salaryMax && job.salaryMin > 0 && job.salaryMax > 0
            ? `€${(job.salaryMin / 1000).toFixed(0)}K–€${(job.salaryMax / 1000).toFixed(0)}K gross/yr`
            : 'Salary: Unknown'
        } · Posted ${job.postedDate}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
              icon={<Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50"
            >
              <span>Original Job</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/applications/app-zalando-01')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Prepare Application
            </Button>
          </div>
        }
      />

      {/* FIT SUMMARY ROW (Categorical labels: Strong / Good / Moderate / Weak) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider block">
            Technical Fit
          </span>
          <div className="mt-1.5">
            <FitBadge fit={job.technicalFit} size="md" />
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">AWS EKS & Terraform</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider block">
            Senior/Lead Fit
          </span>
          <div className="mt-1.5">
            <FitBadge fit={job.seniorLeadFit} size="md" />
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Mentorship & RFCs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider block">
            Salary Fit (€80K+)
          </span>
          <div className="mt-1.5">
            <FitBadge fit={job.salaryFit} size="md" />
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Within Target Compensation Band</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider block">
            Application Readiness
          </span>
          <div className="mt-1.5">
            <FitBadge fit={job.applicationReadiness} size="md" />
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Materials ready to review</span>
        </div>
      </div>

      {/* TWO-COLUMN DETAIL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Deep Evaluation & Match Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION: WHY THIS MATCHES YOUR PROFILE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                Why This Matches Your Profile
              </h2>
            </div>
            <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
              <h3 className="font-semibold text-sm text-purple-950">
                {job.whyMatchesProfile.title}
              </h3>
              <ul className="space-y-2 text-xs text-purple-900/90 leading-relaxed">
                {job.whyMatchesProfile.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION: SKILL MATCH TABLE */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
              Skill & Requirement Evidence Match
            </h2>
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                    <th className="py-3 px-4 w-1/3">Job Requirement</th>
                    <th className="py-3 px-4 w-1/2">Candidate Production Evidence</th>
                    <th className="py-3 px-4 text-center">Fit Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {job.requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 align-top">
                        <span className="font-semibold text-[#0F172A] block">{req.title}</span>
                        <span className="text-[11px] text-[#64748B]">Demand: {req.levelRequired}</span>
                      </td>
                      <td className="py-3 px-4 text-[#475569] leading-relaxed align-top">
                        {req.candidateEvidence}
                      </td>
                      <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                        <FitBadge fit={req.fit} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION: POTENTIAL GAPS & MITIGATION */}
          {job.gaps.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                Identified Gaps & Mitigation Strategies
              </h2>
              <div className="space-y-2.5">
                {job.gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-950">{gap.skill}</span>
                        <Badge variant="amber" size="sm">
                          {gap.type} Gap
                        </Badge>
                      </div>
                      <p className="text-amber-900 mt-1 leading-relaxed">
                        <strong className="font-semibold">Mitigation Strategy:</strong>{' '}
                        {gap.mitigationStrategy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: RELOCATION & WORK AUTHORIZATION EVIDENCE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                  Relocation & Work Authorization Evidence
                </h2>
              </div>
              <EvidenceBadge status={job.relocationStatus} />
            </div>

            <Card padding="md">
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                  <div className="flex items-center justify-between text-[#64748B] text-[11px] mb-1">
                    <span className="font-medium text-slate-700">Source: {job.companyName} Careers Portal</span>
                    <span>Verified: {job.postedDate}</span>
                  </div>
                  <blockquote className="italic text-slate-800 border-l-2 border-emerald-500 pl-3 py-1">
                    "{job.relocationSummary}"
                  </blockquote>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-[#64748B] space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> EU Blue Card Eligibility Factors
                  </div>
                  <p className="leading-relaxed">
                    Requirements vary by eligibility route and must be verified against current official requirements. Candidate holds a recognized university degree (Anabin H+ listed) and 8 years of specialized engineering experience. Salary compatibility is one of multiple factors; full eligibility requires a binding job contract matching degree field and official authority verification at application time. No automated legal verdict is implied.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* SECTION: COMPANY RESEARCH */}
          {company && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                  Company Research & Engineering Signals
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  Full Profile
                </Button>
              </div>

              <Card padding="md">
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#0F172A] block mb-1">Engineering Context</span>
                    <p className="text-[#475569] leading-relaxed">{company.engineeringContext}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A] block mb-1.5">Tech Stack Signals</span>
                    <div className="flex flex-wrap gap-1.5">
                      {company.technologySignals.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded bg-slate-100 text-[#0F172A] font-medium border border-slate-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Action Routes, Contacts, Requirements & Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* RECOMMENDED APPLICATION ROUTE */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Recommended Application Route
              </div>
            }
            padding="md"
          >
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 block text-xs">
                    {job.applicationRoute}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Evidence-Backed
                  </span>
                </div>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  {job.routeReason}
                </p>
                <div className="pt-2 border-t border-blue-200/70 text-[10px] text-blue-900/80 flex items-center justify-between">
                  <span>Routing Strategy: Dual-Track</span>
                  <span>ATS Gateway: Active</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/applications/app-zalando-01')}
              >
                Launch Application Workspace
              </Button>
            </div>
          </Card>

          {/* POTENTIAL REFERRAL CONTACTS */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                  Potential Referral & Hiring Contacts
                </span>
                <span className="text-[11px] font-semibold text-blue-600 cursor-pointer" onClick={() => navigate('/contacts')}>
                  All ({contacts.length})
                </span>
              </div>
            }
            padding="sm"
          >
            <div className="divide-y divide-slate-100 text-xs">
              {contacts.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs">
                  No direct contacts logged for {job.companyName}.
                </div>
              ) : (
                contacts.map((cnt) => (
                  <div key={cnt.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">{cnt.name}</span>
                      <Badge variant="blue" size="sm">
                        {cnt.relationship}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-[#64748B] block">{cnt.role}</span>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">Via {cnt.source}</span>
                      <a
                        href={cnt.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* APPLICATION REQUIREMENTS CHECKLIST */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Submission Requirements
              </div>
            }
            padding="sm"
          >
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(job.applicationRequirements).map(([k, demand]) => {
                const labelMap: Record<string, string> = {
                  cv: 'Tailored CV',
                  coverLetter: 'Cover Letter',
                  portfolio: 'Code/Portfolio Evidence',
                  salaryQuestion: 'Salary Expectation',
                  noticePeriod: 'Notice Period Confirmation',
                  workAuthorization: 'Work Authorization / Visa Status',
                  germanRequirement: 'German Language Evidence',
                };

                return (
                  <div key={k} className="py-2.5 px-3 flex items-center justify-between">
                    <span className="text-slate-700">{labelMap[k] || k}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        demand === 'Required'
                          ? 'bg-rose-50 text-rose-700'
                          : demand === 'Optional'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {demand}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ACTIVITY TIMELINE */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Opportunity Timeline
              </div>
            }
            padding="md"
          >
            <div className="space-y-4 text-xs">
              {job.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0 ring-4 ring-blue-50" />
                  <div>
                    <span className="font-semibold text-[#0F172A]">{item.stage}</span>
                    <span className="text-[11px] text-[#64748B] block">{item.date}</span>
                    {item.notes && (
                      <p className="text-[11px] text-[#475569] mt-0.5">{item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
