import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { generatePanels, listPanels } from '@/services/api/panels';
import { Panel } from '@/utils/types/panel';
import GridReviewPanels from './GridReviewPanels';

vi.mock('@/services/api/panels', () => ({
  listPanels: vi.fn(),
  generatePanels: vi.fn()
}));

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content3: { observatoryPolicy: { cycleInformation: { cycleId: 'mock-cycle-id' } } }
      }
    })
  }
}));

const mockPanels: Panel[] = [
  { id: '1', name: 'Beta', proposals: [], sciReviewers: [], tecReviewers: [] },
  { id: '2', name: 'Alpha', proposals: [], sciReviewers: [], tecReviewers: [] }
];

const theme = createTheme();

const wrapper = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('GridReviewPanels', () => {
  beforeEach(() => {
    vi.mocked(listPanels).mockReset();
    vi.mocked(generatePanels).mockReset().mockResolvedValue({ data: undefined });
  });

  it('renders the alert, and has the panels generated, when there are none', async () => {
    vi.mocked(listPanels).mockResolvedValue({ data: [] });

    wrapper(<GridReviewPanels onRowClick={vi.fn()} />);

    expect(screen.getByTestId('helpPanelId')).toBeInTheDocument();
    await waitFor(() => expect(generatePanels).toHaveBeenCalled());
  });

  it('renders the panels, sorted by name, when there are some', async () => {
    vi.mocked(listPanels).mockResolvedValue({ data: mockPanels });

    wrapper(<GridReviewPanels onRowClick={vi.fn()} />);

    const grid = await screen.findByTestId('dataGridId');
    const names = Array.from(grid.querySelectorAll('[role="row"]'))
      .map((row) => row.textContent)
      .filter((text) => text === 'Alpha' || text === 'Beta');
    expect(names).toEqual(['Alpha', 'Beta']);
    expect(generatePanels).not.toHaveBeenCalled();
  });

  it('keeps the alert, without generating panels, when they cannot be fetched', async () => {
    vi.mocked(listPanels).mockResolvedValue({ error: 'Network Error' });

    wrapper(<GridReviewPanels onRowClick={vi.fn()} />);

    await waitFor(() => expect(listPanels).toHaveBeenCalled());
    expect(screen.getByTestId('helpPanelId')).toBeInTheDocument();
    expect(generatePanels).not.toHaveBeenCalled();
  });
});
