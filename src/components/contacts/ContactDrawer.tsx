import React, { useState } from 'react';
import {
  ExternalLink,
  Mail,
  UserCheck,
  Send,
  MessageSquare,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Contact } from '../../types';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface ContactDrawerProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (contactId: string, text: string, type: 'LinkedIn' | 'Email') => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  contact,
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const [draftType, setDraftType] = useState<'LinkedIn' | 'Email'>('LinkedIn');
  const [draftText, setDraftText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!contact) return null;

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handlePrepopulate = (template: 'referral' | 'recruiter') => {
    if (template === 'referral') {
      setDraftText(
        `Hi ${contact.name.split(' ')[0]},\n\nI hope you are doing well! I noticed the ${
          contact.linkedJobTitle || 'open Cloud / DevOps position'
        } at ${contact.companyName}. With my 8 years of AWS and large-scale Kubernetes experience, I believe I would be a great fit for the team. Would you be open to submitting an internal referral or chatting briefly about the engineering culture?\n\nBest regards,\nSriram Sugavanam`
      );
    } else {
      setDraftText(
        `Hi ${contact.name.split(' ')[0]},\n\nThank you for connecting! I am a Senior DevOps Engineer with 8 years of experience in AWS, multi-tenant Kubernetes, and GitOps, actively relocating to Germany. I would love to learn more about the ${
          contact.linkedJobTitle || 'Platform / Cloud engineering openings'
        } at ${contact.companyName}.\n\nBest regards,\nSriram`
      );
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={contact.name}
      subtitle={`${contact.role} · ${contact.companyName}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">HUMAN ACTION REQUIRED</span>
          </div>
          <a
            href={contact.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <span>Open Profile on LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      }
    >
      {/* Contact Overview */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#64748B]">Relationship</span>
          <Badge variant="blue">{contact.relationship}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#64748B]">Source</span>
          <span className="font-medium text-[#0F172A]">{contact.source}</span>
        </div>
        {contact.linkedJobTitle && (
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Linked Opportunity</span>
            <span className="font-medium text-[#2563EB] truncate max-w-[200px]" title={contact.linkedJobTitle}>
              {contact.linkedJobTitle}
            </span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Email Address</span>
            <span className="font-mono text-slate-800">{contact.email}</span>
          </div>
        )}
        {contact.lastContactDate && (
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Last Contact</span>
            <span className="font-medium text-[#0F172A]">{contact.lastContactDate}</span>
          </div>
        )}
      </div>

      {/* Next Action Box */}
      {contact.nextAction && (
        <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Planned Next Action
            </span>
            {contact.nextActionDueDate && (
              <span className="text-[11px] text-blue-700 font-medium">
                Due: {contact.nextActionDueDate}
              </span>
            )}
          </div>
          <p className="text-blue-950 font-medium">{contact.nextAction}</p>
        </div>
      )}

      {/* Internal Notes */}
      <div className="space-y-1.5 text-xs">
        <span className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] block">
          Relationship Notes
        </span>
        <p className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-[#475569] leading-relaxed">
          {contact.notes || 'No private notes recorded yet.'}
        </p>
      </div>

      {/* Message History */}
      <div className="space-y-2 text-xs">
        <span className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] block">
          Communication History ({contact.messages.length})
        </span>
        <div className="space-y-2">
          {contact.messages.length === 0 ? (
            <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No previous messages logged with this contact.
            </div>
          ) : (
            contact.messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl border text-xs ${
                  m.direction === 'Inbound'
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-blue-50/50 border-blue-100 text-blue-900 ml-4'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                  <span className="font-medium">
                    {m.direction === 'Inbound' ? contact.name : 'You'} via {m.type}
                  </span>
                  <span>{m.date}</span>
                </div>
                {m.subject && <div className="font-semibold mb-1">{m.subject}</div>}
                <p className="leading-relaxed whitespace-pre-line">{m.body}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Drafting Area */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0F172A]">Message Drafter</span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePrepopulate('referral')}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Draft Referral
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => handlePrepopulate('recruiter')}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Draft Recruiter
            </button>
          </div>
        </div>

        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Draft outreach message... (click 'Draft Referral' or 'Draft Recruiter' above for verified template)"
          rows={5}
          className="w-full p-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-blue-500 font-sans"
        />

        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {copiedNotification ? (
              <span className="text-emerald-600 font-semibold">Copied to clipboard!</span>
            ) : (
              'Copy draft to send directly on LinkedIn or via Email'
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyDraft} disabled={!draftText}>
              Copy Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onSendMessage(contact.id, draftText, draftType);
                setDraftText('');
              }}
              disabled={!draftText}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Log Message
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
