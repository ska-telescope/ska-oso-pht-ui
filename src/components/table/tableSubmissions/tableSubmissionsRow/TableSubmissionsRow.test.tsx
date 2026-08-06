import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('TableSubmissionsRow', () => {
  let TableSubmissionsRow: any;
  let mockProposal: any;

  beforeAll(async () => {
    if (!globalThis.localStorage) {
      const storageMock = {
        getItem: () => '0',
        setItem: () => undefined,
        removeItem: () => undefined,
        clear: () => undefined
      };
      Object.defineProperty(globalThis, 'localStorage', {
        value: storageMock,
        writable: true
      });
      if (globalThis.window) {
        Object.defineProperty(globalThis.window, 'localStorage', {
          value: storageMock,
          writable: true
        });
      }
    }

    const { MockProposalFrontend } =
      await import('@/services/axios/get/getProposal/mockProposalFrontend');
    const module = await import('./TableSubmissionsRow');
    TableSubmissionsRow = module.default;
    mockProposal = MockProposalFrontend;
  }, 30000);

  const mockItem = {
    id: 'test-row-id',
    cycle: 'SKA_1962_2024',
    status: 'Draft',
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
    proposal: {} as any,
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
    wrapper(<TableSubmissionsRow {...defaultProps} proposal={mockProposal} />);
    expect(screen.getByText(/Sample Review Title/i)).toBeInTheDocument();
  });

  it('renders title with ellipsis overflow styles', () => {
    wrapper(<TableSubmissionsRow {...defaultProps} proposal={mockProposal} />);

    const title = screen.getByTestId('row-title-test-row-id');
    expect(title).toHaveStyle({ overflow: 'hidden', textOverflow: 'ellipsis' });
  });
});
