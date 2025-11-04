import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GridObservation from './GridObservation';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import Observation from '@/utils/types/observation';

// Mock ResizeObserver for test environment
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

const mockData: Observation[] = [
  {
    id: 'OBS001',
    centralFrequency: 200,
    continuumBandwidth: 150,
    bandwidth: 5,
    numSubBands: 1,
    subarray: 1,
    type: 1,
    telescope: 0,
    linked: '',
    observingBand: 0,
    elevation: 0,
    centralFrequencyUnits: 0,
    continuumBandwidthUnits: null,
    imageWeighting: 0,
    robust: 0,
    supplied: {
      type: 0,
      value: 0,
      units: 0
    },
    spectralResolution: '',
    effectiveResolution: ''
  },
  {
    id: 'OBS002',
    centralFrequency: 300,
    continuumBandwidth: 150,
    bandwidth: 5,
    numSubBands: 1,
    subarray: 1,
    type: 0,
    telescope: 0,
    linked: '',
    observingBand: 0,
    elevation: 0,
    centralFrequencyUnits: 0,
    continuumBandwidthUnits: null,
    imageWeighting: 0,
    robust: 0,
    supplied: {
      type: 0,
      value: 0,
      units: 0
    },
    spectralResolution: '',
    effectiveResolution: ''
  }
];

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <AppFlowProvider>{ui}</AppFlowProvider>
    </ThemeProvider>
  );
};

describe('GridObservation', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  it('renders without crashing and displays rows', () => {
    renderWithProviders(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(screen.getByTestId('gridObservation')).toBeInTheDocument();
    expect(screen.getByText('OBS001')).toBeInTheDocument();
    expect(screen.getByText('OBS002')).toBeInTheDocument();
  });

  it('selects the first row on initial render', () => {
    renderWithProviders(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[0] });
  });

  it('calls rowClick when a row is clicked', () => {
    renderWithProviders(<GridObservation data={mockData} rowClick={rowClickMock} />);
    const secondRow = screen.getByText('OBS002');
    fireEvent.click(secondRow);
    expect(rowClickMock).toHaveBeenCalledWith(expect.objectContaining({ row: mockData[1] }));
  });
});
