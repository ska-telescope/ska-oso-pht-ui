import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
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

vi.mock('./tableReviewDecisionRow/TableReviewDecisionRow', () => ({
  default: (props: any) => (
    <tr data-testid={`row-${props.item.id}`}>
      <td>{props.item.title}</td>
      <td data-testid={`rank-${props.item.id}`}>{props.item.rank}</td>
      <td>
        <button
          onClick={() => props.toggleRow(props.item.id)}
          data-testid={`toggle-${props.item.id}`}
        >
          Toggle
        </button>
      </td>
    </tr>
  )
}));

const mockExclude = vi.fn();
const mockUpdate = vi.fn();

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
    expect(screen.getByTestId('rank-1').textContent).toBe('1');
    expect(screen.getByTestId('rank-4').textContent).toBe('1');

    // Medium Score should be rank 3
    expect(screen.getByTestId('rank-2').textContent).toBe('3');

    // Zero Score should be rank 4 (lowest)
    expect(screen.getByTestId('rank-3').textContent).toBe('4');
  });
});
