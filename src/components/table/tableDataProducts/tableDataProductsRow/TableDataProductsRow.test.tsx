import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import TableDataProductsRow from './TableDataProductsRow';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('TableDataProductsRow', () => {
  const mockItem = {
    observationId: 'obs-dummy-id',
    title: 'Sample Review Title',
    scienceCategory: 'biology',
    decisions: [],
    lastUpdated: '2025-09-17T10:00:00Z',
    rank: 5,
    reviews: []
  };

  const defaultProps = {
    item: mockItem,
    observation: { ...newSvObservation(OBSERVING_MODE.CONTINUUM, 15), id: 'obs-dummy-id' },
    index: 0,
    expanded: false,
    deleteClicked: vi.fn(),
    editClicked: vi.fn(),
    toggleRow: vi.fn(),
    expandButtonRef: () => null,
    updateItem: vi.fn(),
    tableLength: 1,
    t: (key: string) => key // simple mock translation
  };

  it('renders review title and category', () => {
    wrapper(<TableDataProductsRow {...defaultProps} />);

    expect(screen.getByText(/obs-dummy-id/i)).toBeInTheDocument();
  });

  it("shows its observation's mode, telescope and subarray", () => {
    wrapper(<TableDataProductsRow {...defaultProps} />);

    expect(screen.getByText('observationType.continuum')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element?.textContent === 'telescopes.ska_low subArrayConfiguration.aa2_sv',
        { selector: 'p' }
      )
    ).toBeInTheDocument();
  });

  it('renders without its observation details when the observation is gone', () => {
    wrapper(<TableDataProductsRow {...defaultProps} observation={undefined} />);

    expect(screen.getByText(/obs-dummy-id/i)).toBeInTheDocument();
  });

  it('calls toggleRow when expand button is clicked', () => {
    wrapper(<TableDataProductsRow {...defaultProps} />);

    const button = screen.getByTestId('expandIcon');
    fireEvent.click(button);
  });
});
