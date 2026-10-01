import React, { useEffect, useState } from 'react';
import {
  SearchCode,
  ShieldCheck,
  ExternalLink,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { researchApi } from '../api';
import { ResearchEvidence } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { EvidenceBadge, Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Research: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<ResearchEvidence[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const data = await researchApi.getResearchEvidence();
        setEvidenceList(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvidence();
  }, []);

  const filtered = evidenceList.filter((e) => {
    if (activeTab === 'job' && e.category !== 'Job Evidence') return false;
    if (activeTab === 'company' && e.category !== 'Company Evidence') return false;
    if (activeTab === 'relocation' && e.category !== 'Relocation Evidence') return false;
    if (activeTab === 'workAuth' && e.category !== 'Work Authorization Evidence') return false;
    if (activeTab === 'candidate' && e.category !== 'Candidate Evidence') return false;
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research & Evidence Ledger"
        subtitle="Zero-hallucination repository of cited German immigration, company engineering facts, and candidate verification"
      />

      {/* Tabs */}
      <Tabs
        variant="pills"
        tabs={[
          { id: 'all', label: 'All Evidence', count: evidenceList.length },
          { id: 'relocation', label: 'Relocation Evidence', count: evidenceList.filter((e) => e.category === 'Relocation Evidence').length },
          { id: 'workAuth', label: 'Work Authorization', count: evidenceList.filter((e) => e.category === 'Work Authorization Evidence').length },
          { id: 'company', label: 'Company Signals', count: evidenceList.filter((e) => e.category === 'Company Evidence').length },
          { id: 'job', label: 'Job Specifications', count: evidenceList.filter((e) => e.category === 'Job Evidence').length },
          { id: 'candidate', label: 'Candidate Production Evidence', count: evidenceList.filter((e) => e.category === 'Candidate Evidence').length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Verified Evidence Records */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <Card key={item.id} padding="md" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-[#0F172A]">{item.claim}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <EvidenceBadge status={item.status} />
              </div>
            </div>

            {/* Original Citation Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Original Verified Excerpt
              </span>
              <p className="italic text-slate-800 border-l-2 border-blue-500 pl-3 leading-relaxed">
                "{item.originalExcerpt}"
              </p>
            </div>

            {/* Evidence Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#64748B] pt-1">
              <div className="flex items-center gap-3">
                <span>Source: <strong className="text-slate-800">{item.source}</strong></span>
                <span>·</span>
                <span>Captured: {item.capturedDate}</span>
                <span>·</span>
                <span>Confidence: <strong className="text-slate-800">{item.confidenceScore}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <span>Applied to: <span className="text-blue-700 font-medium">{item.usedIn}</span></span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Verification Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
