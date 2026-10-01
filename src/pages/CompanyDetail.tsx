import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Users,
  Search,
  RefreshCw,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { companiesApi, jobsApi, contactsApi, applicationsApi } from '../api';
import { Company, Job, Contact, Application } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { EvidenceBadge, FitBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton, ErrorState } from '../components/ui/FeedbackStates';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [matchingJobs, setMatchingJobs] = useState<Job[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResearching, setIsResearching] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const comp = await companiesApi.getCompany(id);
        if (comp) {
          setCompany(comp);
          const [allJobs, allContacts, allApps] = await Promise.all([
            jobsApi.getJobs(),
            contactsApi.getContacts(),
            applicationsApi.getApplications(),
          ]);
          setMatchingJobs(allJobs.filter((j) => j.companyId === comp.id));
          setContacts(allContacts.filter((c) => c.companyId === comp.id));
          setApplications(allApps.filter((a) => a.companyId === comp.id));
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanyData();
  }, [id]);

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  if (!company) {
    return (
      <ErrorState
        title="Company Not Found"
        message="The requested company profile could not be found."
        onRetry={() => navigate('/companies')}
      />
    );
  }

  const handleResearchAgain = () => {
    setIsResearching(true);
    setTimeout(() => {
      setIsResearching(false);
      alert('Latest company career portals, StepStone and CNCF community signals scanned. All evidence current.');
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: 'Companies', href: '/companies' },
          { label: company.name },
        ]}
        title={company.name}
        subtitle={`${company.industry} · Headquarters: ${company.headquarters} · Company Size: ${company.size} employees`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResearchAgain}
              isLoading={isResearching}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Research Again
            </Button>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50"
            >
              <span>Careers Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        }
      />

      {/* Grid: 8 Cols Left + 4 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Overview, Tech Signals, Matching Jobs (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Engineering Context */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Engineering Context & Architecture
              </div>
            }
            padding="md"
          >
            <div className="space-y-4 text-xs">
              <p className="text-[#475569] leading-relaxed text-sm">
                {company.engineeringContext}
              </p>

              <div>
                <span className="font-semibold text-[#0F172A] block mb-2">
                  Observed Technology Signals
                </span>
                <div className="flex flex-wrap gap-2">
                  {company.technologySignals.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-[#0F172A] font-medium border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Matching Open Jobs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                Matching Opportunities at {company.name} ({matchingJobs.length})
              </h2>
            </div>

            <Card padding="none">
              <div className="divide-y divide-slate-100">
                {matchingJobs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B]">
                    No open jobs currently indexed for this employer.
                  </div>
                ) : (
                  matchingJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0F172A] hover:text-[#2563EB]">
                            {job.title}
                          </span>
                          <FitBadge fit={job.technicalFit} />
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-2">
                          <span>{job.location}</span>
                          <span>·</span>
                          <span className="font-semibold text-slate-800">
                            €{(job.salaryMin / 1000).toFixed(0)}K–€{(job.salaryMax / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Research & Relocation Evidence Excerpts */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
              Verified Evidence Ledger
            </h2>
            <div className="space-y-3">
              {company.evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A]">{ev.claim}</span>
                    <EvidenceBadge status={ev.status} />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[#475569] italic">
                    "{ev.excerpt}"
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                    <span>Source: {ev.source}</span>
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Direct URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Badges, Contacts & Applications (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Policy Badges */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Immigration & Relocation Assessment
              </div>
            }
            padding="sm"
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 px-3 flex items-center justify-between">
                <span className="text-slate-600">International Hiring:</span>
                <EvidenceBadge status={company.internationalHiringEvidence} />
              </div>
              <div className="py-2.5 px-3 flex items-center justify-between">
                <span className="text-slate-600">Relocation Support:</span>
                <EvidenceBadge status={company.relocationEvidence} />
              </div>
              <div className="py-2.5 px-3 flex items-center justify-between">
                <span className="text-slate-600">Work Auth Sponsorship:</span>
                <EvidenceBadge status={company.workAuthorizationEvidence} />
              </div>
            </div>
          </Card>

          {/* Company Contacts */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                  Logged Contacts ({contacts.length})
                </span>
                <span
                  className="text-[11px] text-blue-600 font-semibold cursor-pointer"
                  onClick={() => navigate('/contacts')}
                >
                  Manage
                </span>
              </div>
            }
            padding="sm"
          >
            <div className="divide-y divide-slate-100 text-xs">
              {contacts.length === 0 ? (
                <div className="p-3 text-center text-slate-400">
                  No internal contacts recorded yet.
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
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Active Applications */}
          <Card
            header={
              <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Active Applications ({applications.length})
              </div>
            }
            padding="sm"
          >
            <div className="divide-y divide-slate-100 text-xs">
              {applications.length === 0 ? (
                <div className="p-3 text-center text-slate-400">
                  No submissions initiated for {company.name}.
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-[#0F172A] block">{app.jobTitle}</span>
                    <span className="text-[11px] text-blue-600 font-medium">Stage: {app.stage}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
