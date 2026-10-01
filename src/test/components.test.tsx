import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge, FitBadge, EvidenceBadge, StatusBadge, AutomationBadge } from '../components/ui/Badge';
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
