import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import TableReviewDecision from './TableReviewDecision';

vi.mock('./tableReviewDecisionHeader/TableReviewDecisionHeader', () => ({
  default: () => (
    <thead>
      <tr>
        <th>Header</th>
      </tr>
    </thead>
  )
}));

const mockExclude = vi.fn();
const mockUpdate = vi.fn();

// The rank is the 8th cell of the proposal's row
const rankOf = (title: string) =>
  within(screen.getByText(title).closest('tr')!).getAllByRole('gridcell')[7].textContent;

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('TableReviewDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders titles and passes props correctly', () => {
    const mockData = [
      { id: 1, title: 'Galaxy Formation', reviews: [], decisions: [] },
      { id: 2, title: 'Black Hole Thermodynamics', reviews: [], decisions: [] }
    ];

    wrapper(
      <TableReviewDecision
        data={mockData}
        excludeFunction={mockExclude}
        updateFunction={mockUpdate}
      />
    );

    expect(screen.getByText('Galaxy Formation')).toBeInTheDocument();
    expect(screen.getByText('Black Hole Thermodynamics')).toBeInTheDocument();
  });

  it('calculates correct ranks including ties and zero scores', () => {
    const mockData = [
      {
        id: 1,
        title: 'High Score',
        reviews: [
          {
            reviewType: {
              kind: 'Science Review',
              excludedFromDecision: false,
              rank: 5
            },
            status: 'Reviewed'
          }
        ],
        decisions: []
      },
      {
        id: 2,
        title: 'Medium Score',
        reviews: [
          {
            reviewType: {
              kind: 'Science Review',
              excludedFromDecision: false,
              rank: 3
            },
            status: 'Reviewed'
          }
        ],
        decisions: []
      },
      {
        id: 3,
        title: 'Zero Score',
        reviews: [
          {
            reviewType: {
              kind: 'Science Review',
              excludedFromDecision: false,
              rank: 0
            },
            status: 'To Do' // excluded from scoring
          }
        ],
        decisions: []
      },
      {
        id: 4,
        title: 'Tied Score',
        reviews: [
          {
            reviewType: {
              kind: 'Science Review',
              excludedFromDecision: false,
              rank: 5
            },
            status: 'Reviewed'
          }
        ],
        decisions: []
      }
    ];

    wrapper(
      <TableReviewDecision
        data={mockData}
        excludeFunction={mockExclude}
        updateFunction={mockUpdate}
      />
    );

    // High Score and Tied Score should both be rank 1
    expect(rankOf('High Score')).toBe('1');
    expect(rankOf('Tied Score')).toBe('1');

    // Medium Score should be rank 3
    expect(rankOf('Medium Score')).toBe('3');

    // Zero Score should be rank 4 (lowest)
    expect(rankOf('Zero Score')).toBe('4');
  });
});
