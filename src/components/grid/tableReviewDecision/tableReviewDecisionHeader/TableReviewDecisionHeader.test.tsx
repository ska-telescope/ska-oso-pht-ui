import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableReviewDecisionHeader from './TableReviewDecisionHeader';

describe('ReviewDecisionTableHeader', () => {
  it('renders all expected table headers', () => {
    render(
      <StoreProvider>
        <TableReviewDecisionHeader />
      </StoreProvider>
    );

    expect(screen.getByText(/sciReviews/i)).toBeInTheDocument();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/decisionStatus/i)).toBeInTheDocument();
    expect(screen.getByText(/lastUpdated/i)).toBeInTheDocument();
    expect(screen.getByText(/feasible/i)).toBeInTheDocument();
    expect(screen.getByText(/decisionScore/i)).toBeInTheDocument();
    expect(screen.getByText(/rank/i)).toBeInTheDocument();
    expect(screen.getByText(/recommendation/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();
  });
});
