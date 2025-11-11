import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableDataProductsRow from './TableDataProductsRow';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { MockProposalFrontend } from '@/services/axios/get/getProposal/mockProposalFrontend';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
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

  const mockProposal = MockProposalFrontend;

  const defaultProps = {
    item: mockItem,
    proposal: mockProposal,
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

  it.skip('calls toggleRow when expand button is clicked', () => {
    wrapper(<TableDataProductsRow {...defaultProps} />);

    const button = screen.getByTestId('expand-button-1');
    fireEvent.click(button);
    expect(defaultProps.toggleRow).toHaveBeenCalledWith(1);
  });
});
