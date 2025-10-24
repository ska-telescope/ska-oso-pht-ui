import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableTechnicalReviews from './TableTechnicalReviews';
import { REVIEW_TYPE } from '@/utils/constants';
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

const mockData = {
  id: 'proposal-1',
  title: 'Test Proposal',
  reviews: [
    {
      status: 'Complete',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        isFeasible: 'No'
      }
    },
    {
      status: 'To Do',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        isFeasible: 'Maybe'
      }
    },
    {
      status: 'To Do',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        isFeasible: 'Yes'
      }
    }
  ]
};

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('TableTechnicalReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and rows', () => {
    wrapper(<TableTechnicalReviews data={mockData} />);
    expect(screen.getByText('status.label')).toBeInTheDocument();
  });
});
