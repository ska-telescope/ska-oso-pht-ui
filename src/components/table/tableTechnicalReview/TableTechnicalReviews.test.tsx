import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreProvider } from '@utils/storage/store';
import TableTechnicalReviews from './TableTechnicalReviews';
import { REVIEW_TYPE } from '@/utils/constants';

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

const mockData = {
  id: 'proposal-1',
  title: 'Test Proposal',
  reviews: [
    {
      id: 'review-1',
      status: 'Complete',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        isFeasible: 'No'
      }
    },
    {
      id: 'review-2',
      status: 'To Do',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        isFeasible: 'Maybe'
      }
    },
    {
      id: 'review-3',
      status: 'To Do',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        isFeasible: 'Yes'
      }
    }
  ]
};

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('TableTechnicalReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and rows', () => {
    wrapper(<TableTechnicalReviews data={mockData} />);
    expect(screen.getByText('status.label')).toBeInTheDocument();
  });

  it('keeps each review on its own row when reviews are reordered or removed', () => {
    const { rerender } = wrapper(<TableTechnicalReviews data={mockData} />);
    const rows = ['No', 'Maybe', 'Yes'].map((text) => screen.getByText(text).closest('tr'));

    rerender(
      <StoreProvider>
        <TableTechnicalReviews data={{ ...mockData, reviews: [...mockData.reviews].reverse() }} />
      </StoreProvider>
    );
    ['No', 'Maybe', 'Yes'].forEach((text, i) =>
      expect(screen.getByText(text).closest('tr')).toBe(rows[i])
    );

    rerender(
      <StoreProvider>
        <TableTechnicalReviews data={{ ...mockData, reviews: mockData.reviews.slice(1) }} />
      </StoreProvider>
    );
    expect(screen.queryByText('No')).not.toBeInTheDocument();
    expect(screen.getByText('Maybe').closest('tr')).toBe(rows[1]);
    expect(screen.getByText('Yes').closest('tr')).toBe(rows[2]);
  });
});
