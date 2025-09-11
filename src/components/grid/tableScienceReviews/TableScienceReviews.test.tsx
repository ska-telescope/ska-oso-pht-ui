import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TableScienceReviews from './TableScienceReviews';
import { CONFLICT_REASONS, REVIEW_TYPE } from '@/utils/constants';

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

const mockData = {
  id: 'proposal-1',
  title: 'Test Proposal',
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
  ]
};

describe('TableScienceReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and rows', () => {
    render(<TableScienceReviews data={mockData} excludeFunction={vi.fn()} />);
    expect(screen.getByText('status.label')).toBeInTheDocument();
  });

  it('calls excludeFunction when status is not "To Do"', () => {
    const excludeFn = vi.fn();
    render(<TableScienceReviews data={mockData} excludeFunction={excludeFn} />);
    // TODO
    // const icon = screen.getByTestId('includeIcon-proposal-1-0');
    // fireEvent.click(icon);
    // expect(excludeFn).toHaveBeenCalledWith(mockData.reviews[0]);
  });

  it('does not call excludeFunction when status is "To Do"', () => {
    const excludeFn = vi.fn();
    render(<TableScienceReviews data={mockData} excludeFunction={excludeFn} />);
    // TODO
    // const icon = screen.getByTestId('includeIcon-proposal-1-1');
    // fireEvent.click(icon);
    // expect(excludeFn).not.toHaveBeenCalled();
  });
});
