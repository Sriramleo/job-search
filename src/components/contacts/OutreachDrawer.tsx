import React, { useState } from 'react';
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
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { OutreachQueueItem } from '../../types';

interface OutreachDrawerProps {
  item: OutreachQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onSuppress: (targetType: 'email' | 'domain', targetValue: string, reason?: string) => Promise<void>;
}

export const OutreachDrawer: React.FC<OutreachDrawerProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSuppress,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleCopy = () => {
    if (item.draft) {
      const fullText = `Subject: ${item.draft.subject}\n\n${item.draft.body}\n\n${item.draft.callToAction}\n\n${item.draft.signOff}`;
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <Badge variant={item.status === 'Approved' ? 'green' : item.status === 'Suppressed' ? 'red' : 'blue'}>
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
            <span className="font-semibold">Phase 044 Safety Boundary: Research & Draft Mode</span>
            <p className="mt-0.5 text-blue-800">
              Outbound email sending is strictly disabled by policy. Approving this draft stores your explicit human confirmation. 
              No live emails are transmitted automatically.
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
                <span className="text-amber-700 italic">No public email found (LinkedIn Outreach recommended)</span>
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
            <Badge variant="gray">{item.evidence.confidence} Confidence</Badge>
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
            <span className="text-slate-500 font-medium">Anti-Hallucination Verified Proof Points</span>
            <ul className="space-y-1.5 list-disc list-inside bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-slate-700">
              {item.draft.groundedProofPoints.map((pt, idx) => (
                <li key={idx} className="leading-relaxed">{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tailored Outreach Message Preview */}
        {item.draft ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Tailored Outreach Draft</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-xs h-7 gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Draft'}
              </Button>
            </div>

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
            </div>
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
