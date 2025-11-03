import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  getColCycle,
  getColProposalId,
  getColProposalType,
  getColProposalTitle,
  getColProposalPI,
  getColProposalStatus,
  getColProposalUpdated,
  getColCycleClose,
  getColJobTitle,
  getColDisplayName,
  getColGivenName,
  getColSurname,
  getColReviewerLocation,
  getColReviewerType,
  getColSubExpertise,
  getColStatus
} from './GridColumns';
import { PROPOSAL_STATUS } from '@/utils/constants';

vi.mock('i18next', () => ({
  t: (key: string) => `translated(${key})`
}));

vi.mock('@/utils/present/present', () => ({
  presentLatex: (text: string) => `latex(${text})`,
  presentDate: (ts: string) => `date(${ts})`,
  presentTime: (ts: string) => `time(${ts})`
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content3: {
          observatoryPolicy: {
            cycleInformation: {
              proposalClose: '20250930T12:00:00'
            }
          }
        }
      }
    })
  }
}));

const t = (key: string) => `translated(${key})`;

describe('Reviewer Column Definitions', () => {
  const baseRow = {
    jobTitle: 'Astrophysicist',
    displayName: 'Dr. Jane Doe',
    givenName: 'Jane',
    surname: 'Doe',
    officeLocation: 'Cape Town',
    subExpertise: 'radio',
    status: 'active',
    isScience: true,
    isTechnical: false
  };

  it('getColJobTitle', () => {
    const col = getColJobTitle(t);
    expect(col.field).toBe('title');
    expect(col.headerName).toBe('translated(reviewers.title)');
    expect(col.renderCell({ row: baseRow })).toBe('Astrophysicist');
  });

  it('getColDisplayName', () => {
    const col = getColDisplayName(t);
    expect(col.field).toBe('displayName');
    expect(col.headerName).toBe('translated(reviewers.displayName)');
    expect(col.renderCell({ row: baseRow })).toBe('Dr. Jane Doe');
  });

  it('getColGivenName', () => {
    const col = getColGivenName(t);
    expect(col.field).toBe('givenName');
    expect(col.headerName).toBe('translated(reviewers.givenName)');
    expect(col.renderCell({ row: baseRow })).toBe('Jane');
  });

  it('getColSurname', () => {
    const col = getColSurname(t);
    expect(col.field).toBe('surname');
    expect(col.headerName).toBe('translated(reviewers.surname)');
    expect(col.renderCell({ row: baseRow })).toBe('Doe');
  });

  it('getColReviewerLocation', () => {
    const col = getColReviewerLocation(t);
    expect(col.field).toBe('officeLocation');
    expect(col.headerName).toBe('translated(location.label)');
    expect(col.renderCell({ row: baseRow })).toBe('Cape Town');
  });

  describe('getColReviewerType', () => {
    const mockSetType = vi.fn();

    it('renders science', () => {
      const col = getColReviewerType(t, 'sci', mockSetType);
      expect(col.renderCell({ row: baseRow })).toBe('translated(reviewerType.science)');
    });

    it('renders technical', () => {
      const row = { ...baseRow, isScience: false, isTechnical: true };
      const col = getColReviewerType(t, 'tec', mockSetType);
      expect(col.renderCell({ row })).toBe('translated(reviewerType.technical)');
    });

    it('renders both', () => {
      const row = { ...baseRow, isScience: true, isTechnical: true };
      const col = getColReviewerType(t, 'all', mockSetType);
      expect(col.renderCell({ row })).toBe('translated(reviewerType.both)');
    });

    it('renders empty string', () => {
      const row = { ...baseRow, isScience: false, isTechnical: false };
      const col = getColReviewerType(t, 'all', mockSetType);
      expect(col.renderCell({ row })).toBe('');
    });

    it('has renderHeader', () => {
      const col = getColReviewerType(t, 'all', mockSetType);
      expect(typeof col.renderHeader).toBe('function');
    });
  });

  describe('getColSubExpertise', () => {
    it('renders subExpertise', () => {
      const col = getColSubExpertise(t);
      expect(col.renderCell({ row: baseRow })).toBe(
        'translated(reviewers.subExpertiseCategory.radio)'
      );
    });

    it('handles undefined', () => {
      const row = { ...baseRow, subExpertise: undefined };
      const col = getColSubExpertise(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.subExpertiseCategory.undefined)');
    });

    it('handles null', () => {
      const row = { ...baseRow, subExpertise: null };
      const col = getColSubExpertise(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.subExpertiseCategory.null)');
    });
  });

  describe('getColStatus', () => {
    it('renders status', () => {
      const col = getColStatus(t);
      expect(col.renderCell({ row: baseRow })).toBe('translated(reviewers.statusCategory.active)');
    });

    it('handles undefined', () => {
      const row = { ...baseRow, status: undefined };
      const col = getColStatus(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.statusCategory.notSpecified)');
    });

    it('handles null', () => {
      const row = { ...baseRow, status: null };
      const col = getColStatus(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.statusCategory.notSpecified)');
    });
  });
});

describe('Proposal and Cycle Column Definitions', () => {
  const mockRow = {
    id: 'P-2025-001',
    proposalType: 'standard',
    title: 'Dark Matter Exploration',
    investigators: [
      { firstName: 'Alice', lastName: 'Smith', pi: true },
      { firstName: 'Bob', lastName: 'Jones', pi: false }
    ],
    status: PROPOSAL_STATUS.SUBMITTED,
    lastUpdated: '2025-09-24T10:30:00'
  };

  it('getColCycle', () => {
    const col = getColCycle(t);
    expect(col.field).toBe('cycle');
    expect(col.headerName).toBe('translated(cycle.label)');
    expect(col.width).toBe(160);
  });

  it('getColProposalId', () => {
    const col = getColProposalId(t);
    expect(col.field).toBe('id');
    expect(col.headerName).toBe('translated(proposalId.label)');
    expect(col.width).toBe(200);
  });

  it('getColProposalType', () => {
    const col = getColProposalType(t);
    const rendered = col.renderCell({ row: mockRow });
    expect(col.field).toBe('proposalType');
    expect(col.headerName).toBe('translated(proposalType.label)');
    expect(col.width).toBe(160);
    expect(rendered.props.title).toBe('translated(proposalType.title.standard)');
    expect(rendered.props.children.props.children).toBe('translated(proposalType.code.standard)');
  });

  it('getColProposalTitle', () => {
    const col = getColProposalTitle(t);
    expect(col.field).toBe('title');
    expect(col.headerName).toBe('translated(title.label)');
    expect(col.flex).toBe(3);
    expect(col.minWidth).toBe(250);
    expect(col.renderCell({ row: mockRow })).toBe('latex(Dark Matter Exploration)');
  });

  it('getColProposalPI', () => {
    const col = getColProposalPI(t);
    expect(col.field).toBe('pi');
    expect(col.headerName).toBe('translated(pi.short)');
    expect(col.width).toBe(160);
    expect(col.renderCell({ row: mockRow })).toBe('Smith, Alice');
  });

  it('getColProposalStatus', () => {
    const col = getColProposalStatus(t);
    expect(col.field).toBe('status');
    expect(col.headerName).toBe('translated(status.label)');
    expect(col.width).toBe(160);
    expect(col.renderCell({ row: mockRow })).toBe('translated(proposalStatus.submitted)');
  });

  it('getColProposalUpdated', () => {
    const col = getColProposalUpdated(t);
    expect(col.field).toBe('lastUpdated');
    expect(col.headerName).toBe('translated(updated.label)');
    expect(col.width).toBe(240);
    expect(col.renderCell({ row: mockRow })).toBe(
      'date(2025-09-24T10:30:00) time(2025-09-24T10:30:00)'
    );
  });

  it('getColCycleClose renders correct value', () => {
    const col = getColCycleClose(t);
    expect(col.field).toBe('cycleClose');
    expect(col.headerName).toBe('translated(cycleCloses.label)');
    expect(col.width).toBe(240);
    const Cell = col.renderCell;
    render(<Cell />);
    expect(
      screen.getByText('date(2025-09-30T12:00:00) time(2025-09-30T12:00:00)')
    ).toBeInTheDocument();
  });

  it('getColProposalStatus handles undefined status', () => {
    const row = { ...mockRow, status: undefined };
    const col = getColProposalStatus(t);
    expect(col.renderCell({ row })).toBe('translated(proposalStatus.undefined)');
  });
});
