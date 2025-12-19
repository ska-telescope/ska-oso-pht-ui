import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableReviewDecisionRow from './TableReviewDecisionRow';
import { REVIEW_TYPE } from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('TableReviewDecisionRow', () => {
  const mockItem = {
    id: 1,
    title: 'Sample Review Title',
    scienceCategory: 'biology',
    decisions: [],
    lastUpdated: '2025-09-17T10:00:00Z',
    rank: 5,
    reviews: [
      {
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 3,
          isFeasible: 'Yes',
          excludedFromDecision: false
        },
        status: 'Reviewed'
      },
      {
        reviewType: {
          kind: REVIEW_TYPE.SCIENCE,
          rank: 4,
          isFeasible: 'Yes',
          excludedFromDecision: false
        },
        status: 'Reviewed'
      }
    ]
  };

  const defaultProps = {
    item: mockItem,
    index: 0,
    expanded: false,
    toggleRow: vi.fn(),
    expandButtonRef: () => null,
    excludeFunction: vi.fn(),
    updateDecisionItem: vi.fn(),
    getReviews: (reviews: any[], type: string) => reviews.filter(r => r.reviewType.kind === type),
    getReviewsReviewed: (reviews: any[]) => reviews.filter(r => r.status === 'Reviewed'),
    calculateScore: (_details: any[]) => 3.5,
    trimText: (text: string, maxLength: number) => text.slice(0, maxLength),
    tableLength: 1,
    t: (key: string) => key // simple mock translation
  };

  it('renders review title and category', () => {
    wrapper(<TableReviewDecisionRow {...defaultProps} />);

    expect(screen.getByText(/Sample Review Title/i)).toBeInTheDocument();
    expect(screen.getByText(/scienceCategory.biology/i)).toBeInTheDocument();
  });

  it('renders review count correctly', () => {
    wrapper(<TableReviewDecisionRow {...defaultProps} />);

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('calls toggleRow when expand button is clicked', () => {
    wrapper(<TableReviewDecisionRow {...defaultProps} />);

    const button = screen.getByTestId('expand-button-1');
    fireEvent.click(button);
    expect(defaultProps.toggleRow).toHaveBeenCalledWith(1);
  });
});
