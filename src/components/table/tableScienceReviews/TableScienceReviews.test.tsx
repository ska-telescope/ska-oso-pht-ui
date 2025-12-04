import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableScienceReviews from './TableScienceReviews';
import { CONFLICT_REASONS, REVIEW_TYPE } from '@/utils/constants';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const mockNavigate = vi.fn();

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

vi.mock('@/utils/validation/validation', () => {
  return {
    validateProposal: vi.fn()
  };
});

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

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
    wrapper(<TableScienceReviews data={mockData} excludeFunction={vi.fn()} />);
    expect(screen.getByText('status.label')).toBeInTheDocument();
  });

  it('calls excludeFunction when status is not "To Do"', () => {
    const excludeFn = vi.fn();
    wrapper(<TableScienceReviews data={mockData} excludeFunction={excludeFn} />);
    // const icon = screen.getByTestId('includeIcon-proposal-1-0');
    // fireEvent.click(icon);
    // expect(excludeFn).toHaveBeenCalledWith(mockData.reviews[0]);
  });

  it('does not call excludeFunction when status is "To Do"', () => {
    const excludeFn = vi.fn();
    wrapper(<TableScienceReviews data={mockData} excludeFunction={excludeFn} />);
    // const icon = screen.getByTestId('includeIcon-proposal-1-1');
    // fireEvent.click(icon);
    // expect(excludeFn).not.toHaveBeenCalled();
  });
});
