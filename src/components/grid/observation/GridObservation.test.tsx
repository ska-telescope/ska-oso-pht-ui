import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import GridObservation from './GridObservation';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import Observation from '@/utils/types/observation';
import { BAND_LOW_STR } from '@/utils/constants';

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
    observingBand: BAND_LOW_STR,
    elevation: 0,
    centralFrequencyUnits: 0,
    continuumBandwidthUnits: null,
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
    observingBand: BAND_LOW_STR,
    elevation: 0,
    centralFrequencyUnits: 0,
    continuumBandwidthUnits: null,
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

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <AppFlowProvider>{component}</AppFlowProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

describe('GridObservation', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  it('renders without crashing and displays rows', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(screen.getByTestId('gridObservation')).toBeInTheDocument();
    expect(screen.getByText('OBS001')).toBeInTheDocument();
    expect(screen.getByText('OBS002')).toBeInTheDocument();
  });

  it('selects the first row on initial render', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[0] });
  });

  it('calls rowClick when a row is clicked', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    const secondRow = screen.getByText('OBS002');
    fireEvent.click(secondRow);
    expect(rowClickMock).toHaveBeenCalledWith(expect.objectContaining({ row: mockData[1] }));
  });
});
