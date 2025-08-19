import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TableTechnicalReviews from './TableTechnicalReviews';
import { REVIEW_TYPE } from '@/utils/constants';

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
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        feasibility: {
          isFeasible: 'No',
          comments: 'I have no idea why they thought this might be possible'
        }
      }
    },
    {
      status: 'To Do',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        feasibility: {
          isFeasible: 'Maybe',
          comments: 'This might be possible, but will need to investigate a little further'
        }
      }
    },
    {
      status: 'To Do',
      reviewType: {
        kind: REVIEW_TYPE.TECHNICAL,
        feasibility: {
          isFeasible: 'Yes',
          comments: null
        }
      }
    }
  ]
};

describe('TableTechnicalReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and rows', () => {
    render(<TableTechnicalReviews data={mockData} />);
    expect(screen.getByText('status.label')).toBeInTheDocument();
  });
});
