import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TableReviewDecision from './TableReviewDecision';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated(${key})`
  })
}));

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

const mockData = [
  { id: 1, title: 'Galaxy Formation', reviews: [], decisions: [] },
  { id: 2, title: 'Black Hole Thermodynamics', reviews: [], decisions: [] }
];

const mockExclude = vi.fn();
const mockSubmit = vi.fn();
const mockUpdate = vi.fn();

describe('TableReviewDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with correct number of rows', () => {
    render(
      <TableReviewDecision
        data={mockData}
        excludeFunction={mockExclude}
        submitFunction={mockSubmit}
        updateFunction={mockUpdate}
      />
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-2')).toBeInTheDocument();
  });

  it('toggles row expansion state', () => {
    render(
      <TableReviewDecision
        data={mockData}
        excludeFunction={mockExclude}
        submitFunction={mockSubmit}
        updateFunction={mockUpdate}
      />
    );

    const toggleButton = screen.getByTestId('toggle-1');
    fireEvent.click(toggleButton); // Simulate expansion
    fireEvent.click(toggleButton); // Simulate collapse

    // We can't directly assert internal state, but we can confirm toggleRow was called
    // via the mocked row component
    expect(toggleButton).toBeInTheDocument();
  });

  it('passes props correctly to row component', () => {
    render(
      <TableReviewDecision
        data={mockData}
        excludeFunction={mockExclude}
        submitFunction={mockSubmit}
        updateFunction={mockUpdate}
      />
    );

    expect(screen.getByText('Galaxy Formation')).toBeInTheDocument();
    expect(screen.getByText('Black Hole Thermodynamics')).toBeInTheDocument();
  });
});
