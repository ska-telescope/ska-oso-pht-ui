import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TableSubmissions from './TableSubmissions';

// --- Mocks ---
vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: { content2: { id: 'proposal-1', name: 'Test Proposal' } }
    })
  }
}));

// Stub child components so we can assert they’re called
vi.mock('./tableSubmissionsRow/TableSubmissionsRow', () => ({
  default: ({ item }: any) => (
    <tr>
      <td>Row for {item.name}</td>
    </tr>
  )
}));

vi.mock('../tableContainer/TableContainer', () => ({
  default: ({ children }: any) => <section aria-label="table container">{children}</section>
}));

// --- Tests ---
describe('TableSubmissions', () => {
  it('renders rows for given data', () => {
    const mockData = [
      { id: 1, name: 'Product A' },
      { id: 2, name: 'Product B' }
    ];

    render(<TableSubmissions data={mockData} updateFunction={vi.fn()} deleteFunction={vi.fn()} />);

    const rows = screen.getAllByText(/^Row for/);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Row for Product A');
    expect(rows[1]).toHaveTextContent('Row for Product B');
  });

  it('renders inside TableContainer', () => {
    const mockData = [{ id: 1, name: 'Product A' }];

    render(<TableSubmissions data={mockData} updateFunction={vi.fn()} />);

    expect(screen.getByRole('region', { name: 'table container' })).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<TableSubmissions data={[]} updateFunction={vi.fn()} />);
    expect(screen.queryByText(/^Row for/)).toBeNull();
  });

  it('defines all 8 columns in the colgroup', () => {
    render(<TableSubmissions data={[]} />);

    const table = screen.getByRole('table', { name: 'Table of Proposal Submissions' });
    const cols = table.querySelectorAll('colgroup col');
    expect(cols).toHaveLength(8);
  });
});
