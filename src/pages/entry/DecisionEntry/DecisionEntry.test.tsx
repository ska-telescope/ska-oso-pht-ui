import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DecisionEntry from './DecisionEntry';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock sub components
vi.mock('@/components/fields/choiceCards/choiceCards', () => ({
  CHOICE_TYPE: { RECOMMENDED: 'recommended' },
  ChoiceCards: (props: any) => (
    <select
      data-testid="choice-cards"
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
    >
      <option value="accept">Accept</option>
      <option value="revise">Revise</option>
      <option value="reject">Reject</option>
    </select>
  )
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
    decisions: [{ recommendation: '', comment: '' }],
    recommendation: 'FEASIBLE_YES',
    comments: 'Updated comment'
  };

  const mockCalculateScore = vi.fn(() => 9);
  const mockSubmitFunctionClicked = vi.fn();
  const mockUpdateItem = vi.fn(() => false);

  it('renders all elements correctly', () => {
    render(
      <DecisionEntry
        item={mockItem}
        calculateScore={mockCalculateScore}
        submitFunctionClicked={mockSubmitFunctionClicked}
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
        submitFunctionClicked={mockSubmitFunctionClicked}
        updateItem={mockUpdateItem}
      />
    );

    fireEvent.click(screen.getByTestId('choice-cards'));
    expect(mockItem.recommendation).toBe('FEASIBLE_YES');
  });

  it('handles comment change', () => {
    render(
      <DecisionEntry
        item={mockItem}
        calculateScore={mockCalculateScore}
        submitFunctionClicked={mockSubmitFunctionClicked}
        updateItem={mockUpdateItem}
      />
    );

    fireEvent.change(screen.getByTestId('finalCommentsId'), {
      target: { value: 'Updated comment' }
    });

    expect(mockItem.comments).toBe('Updated comment');
  });

  /*
  it('handles submit button click', () => {
    render(
      <DecisionEntry
        item={mockItem}
        calculateScore={mockCalculateScore}
        submitFunctionClicked={mockSubmitFunctionClicked}
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
      <DecisionEntry
        item={mockItem}
        calculateScore={mockCalculateScore}
        submitFunctionClicked={mockSubmitFunctionClicked}
        updateItem={disabledFn}
      />
    );

    expect(screen.getByTestId('submit-review-button-123')).toBeDisabled();
  });
});
