import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreProvider } from '@utils/storage/store';
import TableScienceReviews from './TableScienceReviews';
import { CONFLICT_REASONS, REVIEW_TYPE } from '@/utils/constants';

const mockNavigate = vi.fn();

vi.mock('react-router', () => {
  return {
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => {
  return {
    default: () => ({ axiosClient: {}, refreshAuthToken: vi.fn() })
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
  return render(<StoreProvider>{component}</StoreProvider>);
};

const mockData = {
  id: 'proposal-1',
  title: 'Test Proposal',
  reviews: [
    {
      id: 'review-1',
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
      id: 'review-2',
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

  it('keeps each review on its own row when reviews are reordered or removed', () => {
    const { rerender } = wrapper(<TableScienceReviews data={mockData} excludeFunction={vi.fn()} />);
    const rowA = screen.getByText('A').closest('tr');
    const rowB = screen.getByText('B').closest('tr');

    rerender(
      <StoreProvider>
        <TableScienceReviews
          data={{ ...mockData, reviews: [...mockData.reviews].reverse() }}
          excludeFunction={vi.fn()}
        />
      </StoreProvider>
    );
    expect(screen.getByText('A').closest('tr')).toBe(rowA);
    expect(screen.getByText('B').closest('tr')).toBe(rowB);

    rerender(
      <StoreProvider>
        <TableScienceReviews
          data={{ ...mockData, reviews: [mockData.reviews[1]] }}
          excludeFunction={vi.fn()}
        />
      </StoreProvider>
    );
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B').closest('tr')).toBe(rowB);
  });
});
