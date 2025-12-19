import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GetPanelList from '@services/axios/get/getPanelList/getPanelList';
import GridReviewPanels from './GridReviewPanels';

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => {
    return {};
  }
}));

vi.mock('@services/axios/get/getPanelList/getPanelList', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/put/putPanel/putPanel', () => ({
  default: vi.fn()
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => {
      return {
        application: {
          content3: {
            observatoryPolicy: {
              cycleInformation: {
                cycleId: 'mock-cycle-id'
              }
            }
          }
        }
      };
    }
  }
}));

const theme = createTheme();

const wrapper = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

/*
const mockPanels = [
  {
    id: '1',
    name: 'Alpha',
    proposals: [],
    sciReviewers: [],
    tecReviewers: [],
    expiresOn: '2025-08-29'
  },
  {
    id: '2',
    name: 'Beta',
    proposals: [],
    sciReviewers: [],
    tecReviewers: [],
    expiresOn: '2025-08-29'
  }
];
*/

describe('GridReviewPanels', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('renders alert when no data is returned', async () => {
    (GetPanelList as any).mockImplementation(() => {
      return Promise.resolve([]);
    });

    wrapper(<GridReviewPanels onRowClick={vi.fn()} />);
    await vi.runAllTicks();

    const alert = screen.getByTestId('helpPanelId');
    expect(alert).toBeInTheDocument();
  });

  /* 
  it('renders DataGrid when data is returned', async () => {
    (GetPanelList as any).mockImplementation(() => {
      return Promise.resolve(mockPanels);
    });

    wrapper(<GridReviewPanels onRowClick={vi.fn()} />);

    let grid;
    for (let i = 0; i < 20; i++) {
      grid = screen.queryByTestId('dataGridId');
      if (grid) break;
      await new Promise(res => setTimeout(res, 250));
    }
    expect(grid).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', async () => {
    (GetPanelList as any).mockResolvedValue(mockPanels);
    const onRowClick = vi.fn();
    wrapper(<GridReviewPanels onRowClick={onRowClick} />);
    await vi.runAllTicks();

    const grid = screen.getByTestId('dataGridId');
    const row = grid.querySelector('[role="row"]');
    if (row) fireEvent.click(row);
    expect(onRowClick).toHaveBeenCalled();
  });

  it('does not render proposals section when listOnly is true', async () => {
    (GetPanelList as any).mockResolvedValue(mockPanels);
    wrapper(<GridReviewPanels onRowClick={vi.fn()} listOnly />);
    await vi.runAllTicks();
    const label = screen.queryByText('proposals.label');
    expect(label).not.toBeInTheDocument();
  });

  it('renders proposals section when listOnly is false', async () => {
    (GetPanelList as any).mockResolvedValue(mockPanels);
    wrapper(<GridReviewPanels onRowClick={vi.fn()} listOnly={false} />);
    await vi.runAllTicks();
    const label = screen.getByText('proposals.label');
    expect(label).toBeInTheDocument();
  });

  it('triggers PutPanel when noPanels is true', async () => {
    (GetPanelList as any).mockImplementation(() => {
      return Promise.resolve([]);
    });

    (PutPanel as any).mockImplementation(() => {
      return Promise.resolve('success');
    });

    wrapper(<GridReviewPanels onRowClick={vi.fn()} />);
    await vi.runAllTicks();
    expect(PutPanel).toHaveBeenCalled();
  });

  it('handles PutPanel error response', async () => {
    (GetPanelList as any).mockImplementation(() => {
      return Promise.resolve([]);
    });

    (PutPanel as any).mockImplementation(() => {
      return Promise.resolve({ error: 'Failed to create panel' });
    });

    wrapper(<GridReviewPanels onRowClick={vi.fn()} />);
    await vi.runAllTicks();
    expect(PutPanel).toHaveBeenCalled();
  });
  */
});
