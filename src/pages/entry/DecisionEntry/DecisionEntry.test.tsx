import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DecisionEntry from './DecisionEntry';
import { RECOMMENDATION_STATUS_DECIDED } from '@/utils/constants';

// Mock translations
vi.mock('react-i18next', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('@/components/button/Submit/Submit', () => ({
  default: ({ action, ...props }: any) => (
    <button data-testid={props['data-testid']} onClick={action} disabled={props.disabled}>
      Submit
    </button>
  )
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  TextEntry: ({ value, setValue, testId }: any) => (
    <textarea data-testid={testId} value={value} onChange={e => setValue(e.target.value)} />
  ),
  LABEL_POSITION: 'Start',
  TELESCOPE_LOW: {
    code: 'low',
    name: 'LOW',
    location: 'Dalgaranga Gold M',
    position: {
      lat: -27.685534514102958,
      lon: 117.08484475669175
    },
    image: 'https://res.cloudinary.com/dmwc3xvv8/image/upload/v1612505143/ska_low_dzquiv.svg'
  },
  TELESCOPE_MID: {
    code: 'mid',
    name: 'MID',
    location: 'Carnarvon',
    position: {
      lat: -30.722597428175952,
      lon: 21.89239803559566
    },
    image: 'https://res.cloudinary.com/dmwc3xvv8/image/upload/v1612505475/ska_mid_mnvuil.svg'
  }
}));

describe('DecisionEntry', () => {
  const mockItem = {
    id: '123',
    title: 'Test Proposal',
    reviews: [{ score: 4 }, { score: 5 }],
    decisions: [{ recommendation: 'FEASIBLE_YES', status: RECOMMENDATION_STATUS_DECIDED }]
  };

  const mockCalculateScore = vi.fn(() => 9);
  const mockUpdateItem = vi.fn(() => false);

  it('renders all elements correctly', () => {
    render(
      <DecisionEntry
        item={mockItem}
        calculateScore={mockCalculateScore}
        updateItem={mockUpdateItem}
      />
    );

    expect(screen.getByText('tableReviewDecision.decisionComments')).toBeInTheDocument();
    expect(screen.getByText('tableReviewDecision.decisionScore 9')).toBeInTheDocument();
    expect(screen.getByTestId('choice-cards')).toBeInTheDocument();
    expect(screen.getByTestId('submit-review-button-123')).toBeInTheDocument();
    expect(screen.getByTestId('finalCommentsId')).toHaveValue('Updated comment');
  });

  it('handles recommendation change', () => {
    render(
      <DecisionEntry
        item={mockItem}
        calculateScore={mockCalculateScore}
        updateItem={mockUpdateItem}
      />
    );

    fireEvent.click(screen.getByTestId('choice-cards'));
    expect(mockItem.decisions[0].recommendation).toBe('FEASIBLE_YES');
  });

  /*
  it('handles submit button click', () => {
    render(
      <DecisionEntry
        item={mockItem}
        calculateScore={mockCalculateScore}
        updateItem={mockUpdateItem}
      />
    );

    fireEvent.click(screen.getByTestId('submit-review-button-123'));
    expect(mockSubmitFunctionClicked).toHaveBeenCalledWith(mockItem);
  });
  */

  it('disables submit button when updateItem returns true', () => {
    const disabledFn = vi.fn(() => true);

    render(
      <DecisionEntry item={mockItem} calculateScore={mockCalculateScore} updateItem={disabledFn} />
    );

    expect(screen.getByTestId('submit-review-button-123')).toBeDisabled();
  });
});
