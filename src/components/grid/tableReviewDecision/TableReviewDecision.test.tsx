import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableReviewDecision from './TableReviewDecision';
import { CONFLICT_REASONS, PANEL_DECISION_STATUS, REVIEW_TYPE } from '@/utils/constants';

const mockNavigate = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('react-router-dom', () => {
  return {
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => {
  return {
    default: () => ({})
  };
});

vi.mock('@/services/axios/getProposal/getProposal', () => {
  return {
    default: vi.fn()
  };
});

vi.mock('@/utils/proposalValidation', () => {
  return {
    validateProposal: vi.fn()
  };
});

const mockDataEmpty = null;

const mockDataToDo = [
  {
    id: 'proposal-1',
    scienceCategory: 'Science Category',
    title: 'Test Proposal',
    details: [],
    reviewStatus: 'STATUS',
    lastUpdated: 'LAST UPDATED',
    rank: 4,
    comments: 'COMMENTS',
    reviews: [
      {
        status: 'Complete',
        comments: 'General comments',
        srcNet: 'SRCNet comments',
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 'A',
          excludedFromDecision: false,
          conflict: {
            hasConflict: false,
            reason: CONFLICT_REASONS[0]
          }
        }
      },
      {
        status: 'To Do',
        comments: 'General comments',
        srcNet: 'SRCNet comments',
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 'B',
          excludedFromDecision: true,
          conflict: {
            hasConflict: false,
            reason: CONFLICT_REASONS[0]
          }
        }
      }
    ],
    decisions: []
  }
];

const mockData = [
  {
    id: 'proposal-1',
    scienceCategory: 'Science Category',
    title: 'Test Proposal',
    details: [],
    reviewStatus: 'STATUS',
    lastUpdated: 'LAST UPDATED',
    rank: 4,
    comments: 'COMMENTS',
    reviews: [
      {
        status: 'Complete',
        comments: 'General comments',
        srcNet: 'SRCNet comments',
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 'A',
          excludedFromDecision: false,
          conflict: {
            hasConflict: false,
            reason: CONFLICT_REASONS[0]
          }
        }
      },
      {
        status: 'To Do',
        comments: 'General comments',
        srcNet: 'SRCNet comments',
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 'B',
          excludedFromDecision: true,
          conflict: {
            hasConflict: false,
            reason: CONFLICT_REASONS[0]
          }
        }
      }
    ],
    decisions: [
      {
        status: PANEL_DECISION_STATUS.REVIEWED
      }
    ]
  }
];

describe('TableReviewDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with null data', () => {
    render(
      <StoreProvider>
        <TableReviewDecision
          data={mockDataEmpty}
          excludeFunction={vi.fn()}
          submitFunction={vi.fn()}
        />
      </StoreProvider>
    );
  });

  it('renders table headers and rows', () => {
    render(
      <StoreProvider>
        <TableReviewDecision data={mockData} excludeFunction={vi.fn()} submitFunction={vi.fn()} />
      </StoreProvider>
    );
  });

  it('calls excludeFunction when status is not "To Do"', () => {
    const excludeFn = vi.fn();
    render(
      <StoreProvider>
        <TableReviewDecision data={mockData} excludeFunction={excludeFn} submitFunction={vi.fn()} />
      </StoreProvider>
    );
    const expandIcon = screen.getByTestId('expand-button-proposal-1');
    fireEvent.click(expandIcon);
    const icon = screen.getByTestId('includeIcon-proposal-1-0');
    fireEvent.click(icon);
    expect(excludeFn).toHaveBeenCalledWith(mockData[0].reviews[0]);
  });

  it('does not call excludeFunction when status is "To Do"', () => {
    const excludeFn = vi.fn();
    render(
      <StoreProvider>
        <TableReviewDecision
          data={mockDataToDo}
          excludeFunction={excludeFn}
          submitFunction={vi.fn()}
        />
      </StoreProvider>
    );
    const expandIcon = screen.getByTestId('expand-button-proposal-1');
    fireEvent.click(expandIcon);
    const icon = screen.getByTestId('includeIcon-proposal-1-1');
    fireEvent.click(icon);
    expect(excludeFn).not.toHaveBeenCalled();
  });
});
