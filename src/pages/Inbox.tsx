import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Inbox as InboxIcon,
  Send,
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Paperclip,
  Copy,
} from 'lucide-react';
import { communicationsApi } from '../api';
import { Communication } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchComms = async () => {
    try {
      const data = await communicationsApi.getCommunications();
      setCommunications(data);
      if (data.length > 0 && !selectedComm) {
        setSelectedComm(data[0]);
        if (data[0].suggestedResponse) {
          setReplyText(data[0].suggestedResponse);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComms();
  }, []);

  const handleSelectMessage = (comm: Communication) => {
    setSelectedComm(comm);
    setReplyText(comm.suggestedResponse || '');
    if (!comm.isRead) {
      communicationsApi.markAsRead(comm.id);
      setCommunications((prev) =>
        prev.map((c) => (c.id === comm.id ? { ...c, isRead: true } : c))
      );
    }
  };

  const filteredComms = communications.filter((c) => {
    if (activeFolder === 'All') return true;
    return c.folder === activeFolder;
  });

  const folders = [
    { id: 'All', label: 'All Mail', count: communications.length },
    { id: 'Recruiters', label: 'Recruiters', count: communications.filter((c) => c.folder === 'Recruiters').length },
    { id: 'Interviews', label: 'Interviews', count: communications.filter((c) => c.folder === 'Interviews').length },
    { id: 'Referrals', label: 'Referrals', count: communications.filter((c) => c.folder === 'Referrals').length },
    { id: 'Applications', label: 'Applications', count: communications.filter((c) => c.folder === 'Applications').length },
    { id: 'HR', label: 'HR & Inquiries', count: communications.filter((c) => c.folder === 'HR').length },
  ];

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Communications Inbox"
        subtitle="Gmail-synchronized inbox for German recruiter screening calls, interview calendar invites, and ATS updates"
        actions={
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[#64748B] font-medium">Synced: sriramsugavanams@gmail.com</span>
          </div>
        }
      />

      {/* Gmail-style Two-Pane Layout */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Pane: Folders + Email List (5 cols) */}
        <div className="md:col-span-5 border-r border-[#E2E8F0] flex flex-col bg-slate-50/40">
          {/* Folders horizontal row */}
          <div className="p-2 border-b border-[#E2E8F0] bg-white flex gap-1 overflow-x-auto text-xs">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={`px-2.5 py-1 rounded-md font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
                  activeFolder === f.id
                    ? 'bg-blue-50 text-[#2563EB]'
                    : 'text-[#64748B] hover:bg-slate-100'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] font-semibold opacity-70">({f.count})</span>
              </button>
            ))}
          </div>

          {/* Email Item List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredComms.map((comm) => {
              const isSelected = selectedComm?.id === comm.id;
              return (
                <div
                  key={comm.id}
                  onClick={() => handleSelectMessage(comm)}
                  className={`p-3.5 cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-3 border-[#2563EB]'
                      : !comm.isRead
                      ? 'bg-white font-semibold'
                      : 'bg-white/70 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F172A] truncate max-w-[180px]">
                      {comm.senderName}
                    </span>
                    <span className="text-[10px] text-[#64748B] whitespace-nowrap">
                      {new Date(comm.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-slate-800 truncate mb-1">
                    {comm.subject}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="text-slate-600 truncate max-w-[140px]">{comm.companyName}</span>
                    <Badge variant={comm.detectedType === 'Interview Invitation' ? 'green' : 'blue'} size="sm">
                      {comm.detectedType}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Email Detail & Suggested Action (7 cols) */}
        <div className="md:col-span-7 flex flex-col bg-white">
          {selectedComm ? (
            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
              {/* Header */}
              <div className="border-b border-[#E2E8F0] pb-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-base font-bold text-[#0F172A] leading-snug">
                    {selectedComm.subject}
                  </h2>
                  <Badge variant={selectedComm.detectedType === 'Interview Invitation' ? 'green' : 'blue'}>
                    {selectedComm.detectedType}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <div>
                    <span className="font-semibold text-slate-800">{selectedComm.senderName}</span>{' '}
                    <span className="text-slate-500 font-mono">&lt;{selectedComm.senderEmail}&gt;</span>
                  </div>
                  <span>{new Date(selectedComm.date).toLocaleString()}</span>
                </div>

                {selectedComm.linkedJobTitle && (
                  <div className="p-2 bg-slate-50 rounded-lg text-xs flex items-center justify-between">
                    <span className="text-[#64748B]">Linked Position:</span>
                    <span
                      onClick={() => navigate(selectedComm.linkedApplicationId ? `/applications/${selectedComm.linkedApplicationId}` : '/workspace')}
                      className="font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {selectedComm.linkedJobTitle} ({selectedComm.companyName})
                    </span>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line space-y-2 flex-1">
                {selectedComm.body}
              </div>

              {/* AI Suggested Response Box */}
              {selectedComm.suggestedResponse && (
                <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Suggested Response Draft
                    </span>
                    <button
                      onClick={() => setReplyText(selectedComm.suggestedResponse || '')}
                      className="text-[11px] text-purple-700 hover:underline font-medium"
                    >
                      Reset Template
                    </button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={5}
                    className="w-full p-3 bg-white border border-purple-200 rounded-lg font-sans text-slate-800 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(replyText);
                        alert('Draft copied to clipboard!');
                      }}
                      icon={<Copy className="w-3.5 h-3.5" />}
                    >
                      Copy Draft
                    </Button>
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Gmail</span>
                    </a>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Have you manually sent this response in Gmail?')) {
                          alert('Marked as sent externally.');
                        }
                      }}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Mark as Sent
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select an email thread from the left pane to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
