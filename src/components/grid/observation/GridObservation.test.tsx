import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import GridObservation from './GridObservation';
import Observation from '@/utils/types/observation';
import {
  BAND_LOW_STR,
  FREQUENCY_GHZ,
  FREQUENCY_MHZ,
  SA_AA2,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '@/utils/constants';

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
    subarray: SA_AA2,
    type: TYPE_CONTINUUM,
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
    subarray: SA_AA2,
    type: TYPE_ZOOM,
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
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
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

describe('GridObservation unit label display', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  const makeObs = (overrides: Partial<Observation>): Observation[] => [
    {
      id: 'OBS-UNITS',
      centralFrequency: 200,
      centralFrequencyUnits: FREQUENCY_MHZ,
      continuumBandwidth: 150,
      continuumBandwidthUnits: FREQUENCY_MHZ,
      bandwidth: 5,
      numSubBands: 1,
      subarray: SA_AA2,
      type: TYPE_CONTINUUM,
      telescope: 0,
      linked: '',
      observingBand: BAND_LOW_STR,
      elevation: 0,
      supplied: { type: 0, value: 0, units: 0 },
      spectralResolution: '',
      effectiveResolution: '',
      ...overrides
    }
  ];

  it('displays MHz label for central frequency when units are MHz', () => {
    wrapper(<GridObservation data={makeObs({ centralFrequencyUnits: FREQUENCY_MHZ })} rowClick={rowClickMock} />);
    expect(screen.getByText(/200 MHz/)).toBeInTheDocument();
  });

  it('does not display kHz label for central frequency when units are MHz', () => {
    wrapper(<GridObservation data={makeObs({ centralFrequencyUnits: FREQUENCY_MHZ })} rowClick={rowClickMock} />);
    expect(screen.queryByText(/200 kHz/)).not.toBeInTheDocument();
  });

  it('displays GHz label for central frequency when units are GHz', () => {
    wrapper(<GridObservation data={makeObs({ centralFrequencyUnits: FREQUENCY_GHZ, centralFrequency: 5 })} rowClick={rowClickMock} />);
    expect(screen.getByText(/5 GHz/)).toBeInTheDocument();
  });

  it('displays MHz label for continuum bandwidth when units are MHz', () => {
    wrapper(<GridObservation data={makeObs({ continuumBandwidthUnits: FREQUENCY_MHZ, type: TYPE_CONTINUUM })} rowClick={rowClickMock} />);
    expect(screen.getByText(/150 MHz/)).toBeInTheDocument();
  });

  it('does not display kHz label for continuum bandwidth when units are MHz', () => {
    wrapper(<GridObservation data={makeObs({ continuumBandwidthUnits: FREQUENCY_MHZ, type: TYPE_CONTINUUM })} rowClick={rowClickMock} />);
    expect(screen.queryByText(/150 kHz/)).not.toBeInTheDocument();
  });
});
