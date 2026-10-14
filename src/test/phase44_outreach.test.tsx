import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OutreachQueueTable } from '../components/contacts/OutreachQueueTable';
import { OutreachDrawer } from '../components/contacts/OutreachDrawer';
import { SuppressionTable } from '../components/contacts/SuppressionTable';
import { OutreachQueueItem, SuppressionRecord } from '../types';

describe('Phase 044: Recruiter Outreach Agent Frontend', () => {
  const sampleItem: OutreachQueueItem = {
    id: 'outreach-001',
    contactName: 'Sabine Meyer',
    contactRole: 'Lead Tech Recruiter',
    companyId: 'comp-zalando',
    companyName: 'Zalando SE',
    targetJobId: 'job-zalando-01',
    targetJobTitle: 'Lead Platform Engineer',
    email: 'recruiting@zalando.de',
    channel: 'Email',
    status: 'Draft Ready',
    evidence: {
      sourceUrl: 'https://jobs.zalando.com/recruiter-sabine',
      sourceType: 'company_careers',
      confidence: 'HIGH',
      confidenceReason: 'Listed recruiter on official posting',
      verifiedAt: '2026-10-14T10:00:00Z',
    },
    draft: {
      subject: 'Lead Platform Engineer — Sriram Sugavanam',
      salutation: 'Hi Sabine,',
      body: 'With over 8 years of DevOps and Kubernetes experience, I am actively relocating to Germany...',
      groundedProofPoints: [
        '8+ years of production experience architecting AWS EKS and Kubernetes',
        'Led GitOps delivery with ArgoCD and Terraform',
      ],
      callToAction: 'If you are open to connecting, please feel free to let me know.',
      signOff: 'Best regards,\nSriram Sugavanam',
      generatedAt: '2026-10-14T10:05:00Z',
    },
    createdAt: '2026-10-14T10:00:00Z',
    updatedAt: '2026-10-14T10:05:00Z',
  };

  it('renders outreach queue table with recruiter and company information', () => {
    const onSelect = vi.fn();
    const onApprove = vi.fn().mockResolvedValue(undefined);
    const onReject = vi.fn().mockResolvedValue(undefined);

    render(
      <OutreachQueueTable
        items={[sampleItem]}
        onSelect={onSelect}
        onApprove={onApprove}
        onReject={onReject}
      />
    );

    expect(screen.getByText('Sabine Meyer')).toBeDefined();
    expect(screen.getByText('Zalando SE')).toBeDefined();
    expect(screen.getByText('Draft Ready')).toBeDefined();
    expect(screen.getByText('HIGH confidence')).toBeDefined();
  });

  it('renders outreach drawer with safety banner and grounded proof points', () => {
    const onClose = vi.fn();
    const onApprove = vi.fn().mockResolvedValue(undefined);
    const onReject = vi.fn().mockResolvedValue(undefined);
    const onSuppress = vi.fn().mockResolvedValue(undefined);

    render(
      <OutreachDrawer
        item={sampleItem}
        isOpen={true}
        onClose={onClose}
        onApprove={onApprove}
        onReject={onReject}
        onSuppress={onSuppress}
      />
    );

    // Verify Safety Invariant text is displayed prominently
    expect(
      screen.getByText(/Phase 044 Safety Boundary: Research & Draft Mode/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Outbound email sending is strictly disabled by policy/i)
    ).toBeDefined();

    // Verify grounded candidate facts are present
    expect(
      screen.getByText(/8\+ years of production experience architecting AWS EKS and Kubernetes/i)
    ).toBeDefined();

    // Verify draft subject & body preview
    expect(screen.getByText('Lead Platform Engineer — Sriram Sugavanam')).toBeDefined();
  });

  it('renders suppression table with rules and opt-out gate notice', () => {
    const sampleSuppression: SuppressionRecord = {
      id: 'supp-1',
      targetType: 'domain',
      targetValue: 'blockeddomain.com',
      reason: 'Corporate opt-out',
      createdAt: '2026-10-14T09:00:00Z',
    };

    const onAdd = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <SuppressionTable
        items={[sampleSuppression]}
        onAdd={onAdd}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('blockeddomain.com')).toBeDefined();
    expect(screen.getByText('Corporate opt-out')).toBeDefined();
    expect(screen.getByText('Compliance & Opt-Out Gate')).toBeDefined();
  });
});
