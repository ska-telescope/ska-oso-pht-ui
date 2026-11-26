import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TableObservations from './TableObservations';
import {
  newSvObservation,
  OBSERVING_MODE,
  type ObservationInput
} from '@/models/proposals/observations';

const observation = (id: string) => ({ ...newSvObservation(OBSERVING_MODE.CONTINUUM, 15), id });

// --- Mocks ---
// The translations read the OSD, which is in the store
vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: { content2: { id: 'proposal-1', name: 'Test Proposal' } }
    })
  }
}));

// Stub child components so we can assert they’re called
vi.mock('./tableObservationsRow/TableObservationsRow', () => ({
  default: ({ observation }: { observation: ObservationInput }) => (
    <div data-testid="row">Row for {observation.id}</div>
  )
}));

vi.mock('../tableContainer/TableContainer', () => ({
  default: ({ children }: any) => <div data-testid="table-container">{children}</div>
}));

// --- Tests ---
describe('TableObservations', () => {
  it('renders rows for given data', () => {
    render(
      <TableObservations
        observations={[observation('obs-1'), observation('obs-2')]}
        updateFunction={vi.fn()}
        deleteFunction={vi.fn()}
      />
    );

    const rows = screen.getAllByTestId('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Row for obs-1');
    expect(rows[1]).toHaveTextContent('Row for obs-2');
  });

  it('renders inside TableContainer', () => {
    render(<TableObservations observations={[observation('obs-1')]} updateFunction={vi.fn()} />);

    expect(screen.getByTestId('table-container')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<TableObservations observations={[]} updateFunction={vi.fn()} />);
    expect(screen.queryByTestId('row')).toBeNull();
  });
});
