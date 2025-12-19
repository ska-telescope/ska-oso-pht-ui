import { describe, it, expect, vi } from 'vitest';
import {
  getColProposalId,
  getColProposalType,
  getColProposalTitle,
  getColProposalPI,
  getColProposalStatus,
  getColProposalUpdated,
  getColCycle
} from './Columns';
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

describe('Cycle Column Definitions', () => {
  it('getColCycle', () => {
    const col = getColCycle(t);
    expect(col.field).toBe('cycle');
    expect(col.headerName).toBe('translated(cycle.label)');
    expect(col.width).toBe(160);
  });

  // it('getColCycleClose renders correct value', () => {
  //   const col = getColCycleClose(t);
  //   expect(col.field).toBe('cycleClose');
  //   expect(col.headerName).toBe('translated(cycleCloses.label)');
  //   expect(col.width).toBe(240);
  //   const Cell = col.renderCell;
  //   render(<Cell />);
  //   expect(
  //     screen.getByText('date(2025-09-30T12:00:00) time(2025-09-30T12:00:00)')
  //   ).toBeInTheDocument();
  // });
});

describe('Proposal Column Definitions', () => {
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

  it('getColProposalStatus handles undefined status', () => {
    const row = { ...mockRow, status: undefined };
    const col = getColProposalStatus(t);
    expect(col.renderCell({ row })).toBe('translated(proposalStatus.undefined)');
  });
});
