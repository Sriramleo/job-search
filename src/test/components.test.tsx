import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge, FitBadge, EvidenceBadge, StatusBadge, AutomationBadge, ClaimBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, KPI } from '../components/ui/Card';
import { ValidationChecklist } from '../components/applications/ValidationChecklist';

describe('Germany Job Hunt — UI Components', () => {
  it('renders FitBadge with categorical text (no arbitrary percentages)', () => {
    const { rerender } = render(<FitBadge fit="Strong" />);
    expect(screen.getByText('Strong Fit')).toBeInTheDocument();

    rerender(<FitBadge fit="Good" />);
    expect(screen.getByText('Good Fit')).toBeInTheDocument();

    rerender(<FitBadge fit="Moderate" />);
    expect(screen.getByText('Moderate Fit')).toBeInTheDocument();
  });

  it('renders EvidenceBadge with strict factual claims', () => {
    const { rerender } = render(<EvidenceBadge status="Confirmed by Source" />);
    expect(screen.getByText('Confirmed by Source')).toBeInTheDocument();

    rerender(<EvidenceBadge status="Evidence Found" />);
    expect(screen.getByText('Evidence Found')).toBeInTheDocument();

    rerender(<EvidenceBadge status="Contradictory" />);
    expect(screen.getByText('Contradictory')).toBeInTheDocument();
  });

  it('renders ClaimBadge with claim-level verification states', () => {
    const { rerender } = render(<ClaimBadge status="Verified" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();

    rerender(<ClaimBadge status="Supported by Profile" />);
    expect(screen.getByText('Supported by Profile')).toBeInTheDocument();

    rerender(<ClaimBadge status="Needs Attestation / Flagged" />);
    expect(screen.getByText('Needs Attestation / Flagged')).toBeInTheDocument();
  });

  it('renders KPI with large tabular values and labels', () => {
    render(<KPI title="Qualified Jobs" value={42} subtitle="€80K+ in Germany" />);
    expect(screen.getByText('Qualified Jobs')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('€80K+ in Germany')).toBeInTheDocument();
  });

  it('renders ValidationChecklist with pass counts and toggle interaction', () => {
    const checklist = {
      correctJob: true,
      correctCompany: true,
      correctCV: true,
      coverLetterReady: true,
      requiredQuestionsAnswered: true,
      workAuthorizationVerified: true,
      noticePeriodVerified: true,
      noFabricatedInfo: true,
      noMissingRequiredFields: true,
    };

    let toggledKey = '';
    render(
      <ValidationChecklist
        checklist={checklist}
        onToggleItem={(k) => {
          toggledKey = k;
        }}
      />
    );

    expect(screen.getByText('Pre-Flight Validation Checklist')).toBeInTheDocument();
    expect(screen.getByText('9 / 9 Ready')).toBeInTheDocument();

    const jobCheck = screen.getByText('Correct Job Position Matched');
    fireEvent.click(jobCheck);
    expect(toggledKey).toBe('correctJob');
  });

  it('separates Fabrication from Unverified and blocks Ready when claim attestation is outstanding', () => {
    const checklist = {
      correctJob: true,
      correctCompany: true,
      correctCV: true,
      coverLetterReady: true,
      requiredQuestionsAnswered: true,
      workAuthorizationVerified: true,
      noticePeriodVerified: true,
      noFabricatedInfo: true,
      noMissingRequiredFields: true,
    };

    const { rerender } = render(
      <ValidationChecklist checklist={checklist} unverifiedClaimsCount={1} />
    );

    // Header counter should be 8/9 Ready and 1 Needs Attestation
    expect(screen.getByText('8 / 9 Ready')).toBeInTheDocument();
    expect(screen.getByText('1 Needs Attestation')).toBeInTheDocument();

    // Fabrication item is PASS
    expect(screen.getByText('No Fabricated Experience Claims')).toBeInTheDocument();

    // Unverified item is REVIEW with 1 requires attestation
    expect(screen.getByText('Unsupported / Unverified Claims')).toBeInTheDocument();
    expect(screen.getByText('1 requires attestation')).toBeInTheDocument();
    expect(screen.getByText('REVIEW')).toBeInTheDocument();

    // When attestation is completed (0 unverified)
    rerender(<ValidationChecklist checklist={checklist} unverifiedClaimsCount={0} />);
    expect(screen.getByText('9 / 9 Ready')).toBeInTheDocument();
    expect(screen.queryByText('1 Needs Attestation')).not.toBeInTheDocument();
    expect(screen.queryByText('REVIEW')).not.toBeInTheDocument();
  });

  it('renders Button states and executes onClick', () => {
    let clicked = false;
    render(
      <Button variant="primary" onClick={() => (clicked = true)}>
        Submit Application
      </Button>
    );

    const btn = screen.getByRole('button', { name: /Submit Application/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(clicked).toBe(true);
  });
});
