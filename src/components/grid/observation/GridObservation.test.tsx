import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GridObservation from './GridObservation';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import Observation from '@/utils/types/observation';

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

const wrapper = (ui: React.ReactElement) => {
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

  it('renders the grid with data', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(screen.getByTestId('observationsGrid')).toBeInTheDocument();
    expect(screen.getByText('OBS001')).toBeInTheDocument();
    expect(screen.getByText('OBS002')).toBeInTheDocument();
  });

  it('calls rowClick with the first row on mount', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[0] });
  });
});
