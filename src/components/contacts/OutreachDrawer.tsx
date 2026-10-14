import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Mail,
  Globe,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Building,
  Briefcase,
  Edit3,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { OutreachQueueItem, OutreachDraftUpdate } from '../../types';

interface OutreachDrawerProps {
  item: OutreachQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onSuppress: (targetType: 'email' | 'domain', targetValue: string, reason?: string) => Promise<void>;
  onUpdateDraft?: (id: string, updates: OutreachDraftUpdate) => Promise<void>;
}

export const OutreachDrawer: React.FC<OutreachDrawerProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSuppress,
  onUpdateDraft,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (item?.draft) {
      setEditSubject(item.draft.subject);
      setEditBody(item.draft.body);
      setEditNotes(item.draft.userNotes || '');
    }
    setIsEditing(false);
  }, [item]);

  if (!item) return null;

  const handleCopy = () => {
    if (item.draft) {
      const fullText = `Subject: ${item.draft.subject}\n\n${item.draft.body}\n\n${item.draft.callToAction}\n\n${item.draft.signOff}`;
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDraft = async () => {
    if (!onUpdateDraft) return;
    setIsSubmitting(true);
    try {
      await onUpdateDraft(item.id, {
        subject: editSubject,
        body: editBody,
        userNotes: editNotes,
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(item.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(item.id, 'User discarded cold outreach draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuppress = async () => {
    if (confirm(`Add ${item.email || item.companyName} to suppression list to prevent any future outreach?`)) {
      setIsSubmitting(true);
      try {
        if (item.email) {
          await onSuppress('email', item.email, 'User requested suppression');
        } else {
          await onSuppress('domain', item.companyName, 'User requested domain suppression');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      title={
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{item.contactName}</span>
          <Badge variant={item.status === 'Approved' ? 'green' : item.status === 'Suppressed' || item.status === 'Opted Out' ? 'red' : item.status === 'Needs Review' ? 'amber' : 'blue'}>
            {item.status}
          </Badge>
        </div>
      }
      subtitle={
        <span className="text-xs text-slate-500">
          {item.contactRole} at {item.companyName} • Target: {item.targetJobTitle}
        </span>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSuppress}
            disabled={isSubmitting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ShieldAlert className="w-4 h-4 mr-1.5" />
            Suppress / Opt-Out
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isSubmitting || item.status === 'Opted Out'}
            >
              <XCircle className="w-4 h-4 mr-1.5 text-slate-400" />
              Discard Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              disabled={isSubmitting || item.status === 'Approved'}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {item.status === 'Approved' ? 'Approved' : 'Approve Draft'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Safety Boundary Notice */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Phase 047 Safety Boundary: Research & Draft Mode</span>
            <p className="mt-0.5 text-blue-800">
              Outbound email sending is strictly disabled by policy. Approving this draft confirms preparation quality; 
              no live emails are transmitted automatically.
            </p>
          </div>
        </div>

        {/* Target Opportunity & Contact Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-slate-500 font-medium flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Company & Target Role
            </div>
            <div className="font-semibold text-slate-800">{item.companyName}</div>
            <div className="text-slate-600">{item.targetJobTitle}</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-slate-500 font-medium flex items-center gap-1.5">
              {item.channel === 'Email' ? <Mail className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />} Channel & Contact Info
            </div>
            <div className="font-semibold text-slate-800">
              {item.email ? (
                <span className="text-emerald-700 font-mono">{item.email}</span>
              ) : (
                <span className="text-amber-700 italic">No verified email (LinkedIn outreach recommended)</span>
              )}
            </div>
            {item.linkedInUrl && (
              <a
                href={item.linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 hover:underline flex items-center gap-1"
              >
                LinkedIn Profile <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Source Evidence & Provenance */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Source Evidence & Provenance</span>
            <Badge variant={item.evidence.confidence === 'HIGH' ? 'green' : 'amber'}>
              {item.evidence.confidence} Confidence
            </Badge>
          </div>
          <p className="text-slate-700">{item.evidence.confidenceReason}</p>
          <a
            href={item.evidence.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 hover:underline flex items-center gap-1 font-mono text-[11px] truncate"
          >
            {item.evidence.sourceUrl} <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>

        {/* Grounded Candidate Proof Points */}
        {item.draft && item.draft.groundedProofPoints && item.draft.groundedProofPoints.length > 0 && (
          <div className="space-y-2 text-xs">
            <span className="text-slate-500 font-medium">Anti-Hallucination Grounded Proof Points</span>
            <ul className="space-y-1.5 list-disc list-inside bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-slate-700">
              {item.draft.groundedProofPoints.map((pt, idx) => (
                <li key={idx} className="leading-relaxed">{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tailored Outreach Message Preview & Editor */}
        {item.draft ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700">Tailored Outreach Draft</span>
                {item.draft.editedAt && (
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    Edited {new Date(item.draft.editedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                      className="text-xs h-7 gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={isSubmitting}
                      className="text-xs h-7 gap-1"
                    >
                      <Save className="w-3 h-3" /> Save
                    </Button>
                  </>
                ) : (
                  <>
                    {onUpdateDraft && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-xs h-7 gap-1 text-slate-600"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-xs h-7 gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="p-4 bg-white border border-primary-200 rounded-xl space-y-3 font-sans text-xs shadow-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Body Text</label>
                  <textarea
                    rows={8}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-1 focus:ring-primary-500 focus:outline-hidden font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Operator Notes</label>
                  <input
                    type="text"
                    placeholder="Optional internal notes..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 font-sans text-xs text-slate-800 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-medium">Subject:</span>{' '}
                  <span className="font-semibold text-slate-900">{item.draft.subject}</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed text-slate-700">
                  {item.draft.body}
                </div>
                <div className="pt-2 text-slate-600 italic border-t border-slate-100">
                  {item.draft.callToAction}
                </div>
                <div className="whitespace-pre-line text-slate-500 pt-1">
                  {item.draft.signOff}
                </div>
                {item.draft.userNotes && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                    <span className="font-medium">Note:</span> {item.draft.userNotes}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
            No draft message generated for this contact yet.
          </div>
        )}
      </div>
    </Drawer>
  );
};
