import React, { useEffect, useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  ExternalLink,
  Plus,
  Eye,
  Archive,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { documentsApi } from '../api';
import { Document } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/FeedbackStates';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await documentsApi.getDocuments();
        setDocuments(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter((d) => {
    if (activeTab === 'master' && d.type !== 'Master CV') return false;
    if (activeTab === 'variants' && d.type !== 'CV Variant') return false;
    if (activeTab === 'coverLetters' && d.type !== 'Cover Letter') return false;
    if (activeTab === 'qa' && d.type !== 'Application Answers') return false;
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents & CV Repository"
        subtitle="Master resume, tailored German CV variants, targeted cover letters, and verified application answers"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPreviewDoc(documents[0])}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Preview Master CV
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        variant="pills"
        tabs={[
          { id: 'all', label: 'All Documents', count: documents.length },
          { id: 'master', label: 'Master CV', count: documents.filter((d) => d.type === 'Master CV').length },
          { id: 'variants', label: 'CV Variants', count: documents.filter((d) => d.type === 'CV Variant').length },
          { id: 'coverLetters', label: 'Cover Letters', count: documents.filter((d) => d.type === 'Cover Letter').length },
          { id: 'qa', label: 'Application Answers', count: documents.filter((d) => d.type === 'Application Answers').length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <Card
            key={doc.id}
            padding="md"
            className="flex flex-col justify-between hover:border-slate-300 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={doc.type === 'Master CV' ? 'purple' : 'blue'}>
                  {doc.type}
                </Badge>
                <span className="text-xs font-mono font-semibold text-[#64748B]">
                  {doc.version}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                  {doc.title}
                </h3>
                {doc.linkedCompany && (
                  <span className="text-xs text-[#64748B] block mt-0.5 font-medium">
                    Tailored for: {doc.linkedCompany}
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-slate-700 line-clamp-3 leading-relaxed">
                {doc.content}
              </div>

              {/* Source Evidence Lineage */}
              {doc.sourceEvidenceReferences && doc.sourceEvidenceReferences.length > 0 && (
                <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    {doc.sourceEvidenceReferences.length} Evidence Sources
                  </span>
                  <span className="text-[10px] text-blue-700 font-mono">
                    Traceable Lineage
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {doc.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#64748B]">Updated {doc.updatedAt}</span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewDoc(doc)}
                  className="p-1 text-blue-600"
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(doc.content);
                    alert('Document content copied!');
                  }}
                  icon={<Copy className="w-3.5 h-3.5" />}
                >
                  Copy
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Document View Modal with Evidence Lineage */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">Version {previewDoc.version} · {previewDoc.type}</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(previewDoc.content);
                  alert('Content copied!');
                }}
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy Content
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Evidence Lineage Section */}
            {previewDoc.sourceEvidenceReferences && previewDoc.sourceEvidenceReferences.length > 0 && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Source Evidence Lineage & Backing
                </div>
                <div className="space-y-1.5">
                  {previewDoc.sourceEvidenceReferences.map((ref, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-blue-100 flex items-start justify-between text-[11px]">
                      <div>
                        <span className="font-medium text-slate-800 block">"{ref.claim}"</span>
                        <span className="text-slate-500 text-[10px]">Source: {ref.source}</span>
                      </div>
                      <span className="text-[10px] text-blue-700 font-mono font-semibold ml-2 shrink-0">
                        #{ref.evidenceId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800">
              {previewDoc.content}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
