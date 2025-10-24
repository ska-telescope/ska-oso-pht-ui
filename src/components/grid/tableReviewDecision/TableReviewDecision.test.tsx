import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableReviewDecision from './TableReviewDecision';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

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
const mockUpdate = vi.fn();

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('TableReviewDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes props correctly to row component', () => {
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
});
