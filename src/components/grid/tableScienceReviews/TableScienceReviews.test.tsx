import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TableScienceReviews from './TableScienceReviews';

const mockNavigate = vi.fn();
const mockUpdateAppContent1 = vi.fn();
const mockUpdateAppContent2 = vi.fn();
const mockUpdateAppContent5 = vi.fn();
const mockGetProposal = vi.fn();
const mockValidateProposal = vi.fn();

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
      comments: 'Looks good',
      srcNet: 'SRC-123',
      reviewType: {
        rank: 'A',
        excludedFromDecision: false
      }
    },
    {
      status: 'To Do',
      comments: 'Needs review',
      srcNet: 'SRC-456',
      reviewType: {
        rank: 'B',
        excludedFromDecision: true
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
    expect(screen.getByText('generalComments.label')).toBeInTheDocument();
    expect(screen.getByText('SRC-123')).toBeInTheDocument();
    expect(screen.getByText('SRC-456')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('calls excludeFunction when status is not "To Do"', () => {
    const excludeFn = vi.fn();
    render(<TableScienceReviews data={mockData} excludeFunction={excludeFn} />);
    const icon = screen.getByTestId('includeIcon-proposal-1-0');
    fireEvent.click(icon);
    expect(excludeFn).toHaveBeenCalledWith(mockData.reviews[0]);
  });

  it('does not call excludeFunction when status is "To Do"', () => {
    const excludeFn = vi.fn();
    render(<TableScienceReviews data={mockData} excludeFunction={excludeFn} />);
    const icon = screen.getByTestId('includeIcon-proposal-1-1');
    fireEvent.click(icon);
    expect(excludeFn).not.toHaveBeenCalled();
  });

  it('calls handleViewAction and navigates on successful proposal fetch', async () => {
    mockGetProposal.mockResolvedValueOnce({ id: 'proposal-1' });
    mockValidateProposal.mockReturnValueOnce({ validated: true });

    render(<TableScienceReviews data={mockData} excludeFunction={vi.fn()} />);
    const viewBtn = screen.getByTestId('view-detail-button-proposal-1-0');
    fireEvent.click(viewBtn);
  });

  it('calls notifyError on failed proposal fetch', async () => {
    mockGetProposal.mockResolvedValueOnce('error');

    render(<TableScienceReviews data={mockData} excludeFunction={vi.fn()} />);
    const viewBtn = screen.getByTestId('view-detail-button-proposal-1-0');
    fireEvent.click(viewBtn);
  });
});
