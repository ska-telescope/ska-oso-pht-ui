import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TableObservations from './TableObservations';

// --- Mocks ---
vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: { content2: { id: 'proposal-1', name: 'Test Proposal' } }
    })
  }
}));

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // simple passthrough
  })
}));

// Stub child components so we can assert they’re called
vi.mock('./tableObservationsRow/TableObservationsRow', () => ({
  default: ({ item }: any) => <div data-testid="row">Row for {item.name}</div>
}));

vi.mock('../tableContainer/TableContainer', () => ({
  default: ({ children }: any) => <div data-testid="table-container">{children}</div>
}));

// --- Tests ---
describe('TableObservations', () => {
  it('renders rows for given data', () => {
    const mockData = [
      { id: 1, name: 'Product A' },
      { id: 2, name: 'Product B' }
    ];

    render(<TableObservations data={mockData} updateFunction={vi.fn()} deleteFunction={vi.fn()} />);

    const rows = screen.getAllByTestId('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Row for Product A');
    expect(rows[1]).toHaveTextContent('Row for Product B');
  });

  it('renders inside TableContainer', () => {
    const mockData = [{ id: 1, name: 'Product A' }];

    render(<TableObservations data={mockData} updateFunction={vi.fn()} />);

    expect(screen.getByTestId('table-container')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<TableObservations data={[]} updateFunction={vi.fn()} />);
    expect(screen.queryByTestId('row')).toBeNull();
  });
});
