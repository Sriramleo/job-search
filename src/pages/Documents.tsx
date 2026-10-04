import React, { useEffect, useState, useRef } from 'react';
import {
  FileText,
  Copy,
  Download,
  Upload,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FileUp,
  RefreshCw,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { documentsApi } from '../api';
import { Document } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('Master CV');
  const [uploadVersion, setUploadVersion] = useState('v1.0');
  const [uploadTags, setUploadTags] = useState('germany, cloud, devops');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentsApi.getDocuments();
      setDocuments(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const masterDoc = documents.find((d) => d.type === 'Master CV' || d.id === 'doc-cv-master');

  const filteredDocs = documents.filter((d) => {
    if (activeTab === 'master' && d.type !== 'Master CV') return false;
    if (activeTab === 'variants' && d.type !== 'CV Variant') return false;
    if (activeTab === 'coverLetters' && d.type !== 'Cover Letter') return false;
    if (activeTab === 'qa' && d.type !== 'Application Answers') return false;
    return true;
  });

  const handleOpenUpload = (defaultType = 'Master CV') => {
    setUploadType(defaultType);
    setSelectedFile(null);
    setUploadTitle('');
    setUploadVersion(defaultType === 'Master CV' && masterDoc ? 'v1.1' : 'v1.0');
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleExecuteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', uploadType);
      formData.append('title', uploadTitle || selectedFile.name);
      formData.append('version', uploadVersion || 'v1.0');
      formData.append('candidate_id', 'cand-sriram');
      formData.append('tags', uploadTags);

      await documentsApi.uploadDocument(formData);
      await fetchDocuments();
      setIsUploadModalOpen(false);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload document. Please verify network connectivity.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (doc: Document) => {
    const url = documentsApi.getDownloadUrl(doc.id);
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', (doc as any).filename || `${doc.id}.md`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  if (isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents & CV Repository"
        subtitle="Canonical Master resume, tailored German CV variants, targeted cover letters, and verified application answers"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenUpload('CV Variant')}
              icon={<FileUp className="w-3.5 h-3.5" />}
            >
              Upload Variant
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenUpload('Master CV')}
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Upload / Replace Master CV
            </Button>
          </div>
        }
      />

      {/* MASTER CV HERO CARD */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {masterDoc ? masterDoc.title : 'Master CV (Canonical Profile)'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-indigo-400/20 text-indigo-200 border border-indigo-400/40">
                    {masterDoc ? masterDoc.version : 'Unset'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {masterDoc
                    ? `Canonical source of truth for claims attestation and ATS tailoring · Updated ${masterDoc.updatedAt}`
                    : 'No Master CV active. Upload your resume to anchor German ATS tailoring.'}
                </p>
              </div>
            </div>

            {masterDoc && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                {(masterDoc as any).filename && (
                  <span className="font-mono text-[11px] text-indigo-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    📄 {(masterDoc as any).filename}
                  </span>
                )}
                {(masterDoc as any).fileSizeBytes && (
                  <span className="text-slate-400 text-[11px]">
                    Size: {Math.round((masterDoc as any).fileSizeBytes / 1024)} KB
                  </span>
                )}
                {masterDoc.sourceEvidenceReferences && (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {masterDoc.sourceEvidenceReferences.length} Evidence Links
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {masterDoc && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={() => setPreviewDoc(masterDoc)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  Preview
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={() => handleDownload(masterDoc)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
              </>
            )}
            <Button
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-transparent"
              onClick={() => handleOpenUpload('Master CV')}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              {masterDoc ? 'Replace CV' : 'Upload Master CV'}
            </Button>
          </div>
        </div>
      </div>

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

      {/* Document Grid or Empty State */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-8 h-8 stroke-[1.5]" />}
          title="No documents in this category"
          description="Upload your resume or tailored application materials to manage documents and provenance."
          actionText="Upload Document"
          onAction={() => handleOpenUpload(activeTab === 'coverLetters' ? 'Cover Letter' : 'Master CV')}
        />
      ) : (
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
                  {(doc.tags || []).map((t) => (
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
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="p-1 text-slate-600 hover:text-slate-900"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
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
      )}

      {/* UPLOAD / REPLACE DOCUMENT MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={uploadType === 'Master CV' ? 'Upload / Replace Master CV' : `Upload ${uploadType}`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteUpload}
              disabled={!selectedFile || isUploading}
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleExecuteUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {uploadError}
            </div>
          )}

          {/* File Picker Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.md,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <span className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileUp className="w-6 h-6" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to browse or drag file here'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supported formats: PDF, DOCX, Markdown (.md), Plain Text (.txt)
                </p>
              </div>
              {selectedFile && (
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {Math.round(selectedFile.size / 1024)} KB ready to upload
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Document Type
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="Master CV">Master CV</option>
                <option value="CV Variant">CV Variant</option>
                <option value="Cover Letter">Cover Letter</option>
                <option value="Application Answers">Application Answers</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Version Tag
              </label>
              <input
                type="text"
                value={uploadVersion}
                onChange={(e) => setUploadVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Sriram Sugavanam - Cloud Platform Master Resume"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={uploadTags}
              onChange={(e) => setUploadTags(e.target.value)}
              placeholder="kubernetes, devops, bafin, sre"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">
                Version {previewDoc.version} · {previewDoc.type}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(previewDoc)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
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
