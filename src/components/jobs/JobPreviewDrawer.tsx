import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  MapPin,
  Building,
  Euro,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Job } from '../../types';
import { Drawer } from '../ui/Drawer';
import { FitBadge, EvidenceBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface JobPreviewDrawerProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobPreviewDrawer: React.FC<JobPreviewDrawerProps> = ({
  job,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!job) return null;

  const handleOpenWorkspace = () => {
    onClose();
    // Navigate to application workspace for this job or primary workspace
    navigate(`/applications/app-zalando-01`);
  };

  const handleOpenFullJob = () => {
    onClose();
    navigate(`/jobs/${job.id}`);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={job.title}
      subtitle={`${job.companyName} · ${job.location}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" size="sm" onClick={handleOpenFullJob}>
            Open Full Job Spec
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenWorkspace}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Prepare in Workspace
          </Button>
        </div>
      }
    >
      {/* Top Metadata Strip */}
      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
        <div>
          <span className="text-[#64748B] block text-[11px]">Salary Compensation</span>
          <span className="font-semibold text-sm text-[#0F172A] tabular-nums">
            {job.salaryMin && job.salaryMax && job.salaryMin > 0 && job.salaryMax > 0
              ? `€${(job.salaryMin / 1000).toFixed(0)}K–€${(job.salaryMax / 1000).toFixed(0)}K`
              : 'Unknown'}
          </span>
        </div>
        <div>
          <span className="text-[#64748B] block text-[11px]">Seniority & Mode</span>
          <span className="font-medium text-[#0F172A]">
            {job.seniority} · {job.workModel}
          </span>
        </div>
        <div>
          <span className="text-[#64748B] block text-[11px]">Technical Match</span>
          <div className="mt-0.5">
            <FitBadge fit={job.technicalFit} />
          </div>
        </div>
        <div>
          <span className="text-[#64748B] block text-[11px]">Relocation Evidence</span>
          <div className="mt-0.5">
            <EvidenceBadge status={job.relocationStatus} />
          </div>
        </div>
      </div>

      {/* Why This Matches Your Profile */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Why This Matches Your Profile</span>
        </div>
        <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
          <div className="text-xs font-medium text-purple-950 mb-2">
            {job.whyMatchesProfile.title}
          </div>
          <ul className="space-y-1.5 text-xs text-purple-900/90">
            {job.whyMatchesProfile.points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Relocation & Work Authorization Evidence */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Relocation & Visa Evidence</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#0F172A]">Policy Stance:</span>
            <EvidenceBadge status={job.relocationStatus} />
          </div>
          <p className="text-[#475569] leading-relaxed pt-1">{job.relocationSummary}</p>
        </div>
      </div>

      {/* Recommended Route */}
      <div className="space-y-1.5 text-xs">
        <span className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] block">
          Recommended Application Route
        </span>
        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
          <div className="font-semibold text-blue-900">{job.applicationRoute}</div>
          <div className="text-[11px] text-blue-700 mt-1">{job.routeReason}</div>
        </div>
      </div>

      {/* Key Skills */}
      <div className="space-y-2">
        <span className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] block">
          Core Technologies
        </span>
        <div className="flex flex-wrap gap-1.5">
          {job.keySkills.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-100 text-[#0F172A] font-medium border border-slate-200/70"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Short Job Description Excerpt */}
      <div className="space-y-1.5 text-xs text-[#475569]">
        <span className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] block">
          Role Summary
        </span>
        <p className="leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          {job.description}
        </p>
      </div>
    </Drawer>
  );
};
