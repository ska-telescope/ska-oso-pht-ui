import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TableReviewDecision from './TableReviewDecision';
import { PANEL_DECISION_STATUS, REVIEW_TYPE } from '@/utils/constants';

const mockNavigate = vi.fn();
const mockUpdateAppContent1 = vi.fn();
const mockUpdateAppContent2 = vi.fn();
const mockUpdateAppContent5 = vi.fn();

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

vi.mock('@ska-telescope/ska-gui-local-storage', () => {
  return {
    storageObject: {
      useStore: () => ({
        clearApp: vi.fn(),
        updateAppContent1: mockUpdateAppContent1,
        updateAppContent2: mockUpdateAppContent2,
        updateAppContent5: mockUpdateAppContent5
      })
    }
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
          excludedFromDecision: false
        }
      },
      {
        status: 'To Do',
        comments: 'General comments',
        srcNet: 'SRCNet comments',
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 'B',
          excludedFromDecision: true
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
          excludedFromDecision: false
        }
      },
      {
        status: 'To Do',
        comments: 'General comments',
        srcNet: 'SRCNet comments',
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 'B',
          excludedFromDecision: true
        }
      }
    ],
    decisions: [
      {
        status: PANEL_DECISION_STATUS.DECIDED
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
      <TableReviewDecision
        data={mockDataEmpty}
        excludeFunction={vi.fn()}
        submitFunction={vi.fn()}
      />
    );
  });

  it('renders table headers and rows', () => {
    render(
      <TableReviewDecision data={mockData} excludeFunction={vi.fn()} submitFunction={vi.fn()} />
    );
  });

  it('calls excludeFunction when status is not "To Do"', () => {
    const excludeFn = vi.fn();
    render(
      <TableReviewDecision data={mockData} excludeFunction={excludeFn} submitFunction={vi.fn()} />
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
      <TableReviewDecision
        data={mockDataToDo}
        excludeFunction={excludeFn}
        submitFunction={vi.fn()}
      />
    );
    const expandIcon = screen.getByTestId('expand-button-proposal-1');
    fireEvent.click(expandIcon);
    const icon = screen.getByTestId('includeIcon-proposal-1-1');
    fireEvent.click(icon);
    expect(excludeFn).not.toHaveBeenCalled();
  });
});
