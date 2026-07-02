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
  TYPE_ZOOM,
  TYPE_PST
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
});

describe('GridObservation border styling', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  it('applies grey.400 border color to all observation cards', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    const rows = screen.getAllByText(/OBS00/);
    rows.forEach(row => {
      const card = row.closest('[class*="MuiStack"]');
      expect(card).toHaveStyle({ borderColor: expect.stringContaining('rgb') });
    });
  });
});

describe('GridObservation spectral resolution conditional rendering', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  const makeObs = (overrides: Partial<Observation>): Observation[] => [
    {
      id: 'OBS-SPEC',
      centralFrequency: 200,
      centralFrequencyUnits: FREQUENCY_MHZ,
      continuumBandwidth: 150,
      continuumBandwidthUnits: FREQUENCY_MHZ,
      bandwidth: 5,
      numSubBands: 1,
      subarray: SA_AA2,
      type: TYPE_ZOOM,
      telescope: 0,
      linked: '',
      observingBand: BAND_LOW_STR,
      elevation: 0,
      supplied: { type: 0, value: 10, units: 0 },
      spectralResolution: '',
      effectiveResolution: '',
      ...overrides
    }
  ];

  it('displays Spectral Resolution when value is provided', () => {
    wrapper(
      <GridObservation 
        data={makeObs({ spectralResolution: '0.5' })} 
        rowClick={rowClickMock} 
      />
    );
    expect(screen.getByText(/Spectral Resolution: 0\.5/)).toBeInTheDocument();
  });

  it('does not display Spectral Resolution line when value is empty string', () => {
    wrapper(
      <GridObservation 
        data={makeObs({ spectralResolution: '' })} 
        rowClick={rowClickMock} 
      />
    );
    expect(screen.queryByText(/Spectral Resolution:/)).not.toBeInTheDocument();
  });

  it('does not display Spectral Resolution line when value is undefined', () => {
    wrapper(
      <GridObservation 
        data={makeObs({ spectralResolution: undefined })} 
        rowClick={rowClickMock} 
      />
    );
    expect(screen.queryByText(/Spectral Resolution:/)).not.toBeInTheDocument();
  });

  it('displays Spectral Resolution for zoom observations with value', () => {
    const multiObs = [
      {
        id: 'CONTINUUM-OBS',
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
        supplied: { type: 0, value: 10, units: 0 },
        spectralResolution: '',
        effectiveResolution: ''
      },
      {
        id: 'ZOOM-OBS',
        centralFrequency: 200,
        centralFrequencyUnits: FREQUENCY_MHZ,
        continuumBandwidth: 150,
        continuumBandwidthUnits: FREQUENCY_MHZ,
        bandwidth: 5,
        numSubBands: 1,
        subarray: SA_AA2,
        type: TYPE_ZOOM,
        telescope: 0,
        linked: '',
        observingBand: BAND_LOW_STR,
        elevation: 0,
        supplied: { type: 0, value: 10, units: 0 },
        spectralResolution: '1.0',
        effectiveResolution: ''
      }
    ];

    wrapper(<GridObservation data={multiObs} rowClick={rowClickMock} />);
    
    // Continuum observation should show hard-coded spectral resolution
    expect(screen.getByText(/Spectral Resolution: 5\.43 kHz/)).toBeInTheDocument();

    // Zoom observation should show spectral resolution from row value
    expect(screen.getByText(/Spectral Resolution: 1\.0/)).toBeInTheDocument();
  });
});

describe('GridObservation auto-select behavior', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  it('auto-selects first row when no autoSelectId is provided', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[0] });
  });

  it('prioritizes autoSelectId over first row auto-select', () => {
    wrapper(
      <GridObservation 
        data={mockData} 
        rowClick={rowClickMock} 
        autoSelectId="OBS002"
      />
    );
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[1] });
  });

  it('falls back to first row when autoSelectId does not exist in data', () => {
    wrapper(
      <GridObservation 
        data={mockData} 
        rowClick={rowClickMock} 
        autoSelectId="NON_EXISTENT"
      />
    );
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[0] });
  });

  it('only auto-selects once even with data updates', () => {
    const { rerender } = wrapper(
      <GridObservation data={mockData} rowClick={rowClickMock} />
    );
    expect(rowClickMock).toHaveBeenCalledTimes(1);

    rerender(
      <StoreProvider>
        <ThemeProvider theme={theme}>
          <GridObservation data={[...mockData]} rowClick={rowClickMock} />
        </ThemeProvider>
      </StoreProvider>
    );
    expect(rowClickMock).toHaveBeenCalledTimes(1);
  });
});

describe('GridObservation disabled state', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  it('does not call rowClick when disabled prop is true', () => {
    wrapper(
      <GridObservation 
        data={mockData} 
        rowClick={rowClickMock} 
        disabled={true}
      />
    );
    
    const firstCallCount = rowClickMock.mock.calls.length;
    
    const secondRow = screen.getByText('OBS002');
    fireEvent.click(secondRow);
    
    expect(rowClickMock).toHaveBeenCalledTimes(firstCallCount);
  });

  it('calls rowClick when disabled prop is false', () => {
    wrapper(
      <GridObservation 
        data={mockData} 
        rowClick={rowClickMock} 
        disabled={false}
      />
    );
    
    const firstCallCount = rowClickMock.mock.calls.length;
    
    const secondRow = screen.getByText('OBS002');
    fireEvent.click(secondRow);
    
    expect(rowClickMock).toHaveBeenCalledTimes(firstCallCount + 1);
  });
});
describe('GridObservation hard-coded spectral resolution fallback', () => {
  let rowClickMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rowClickMock = vi.fn();
  });

  const makeObs = (overrides: Partial<Observation>): Observation[] => [
    {
      id: 'OBS-SPECTRAL',
      centralFrequency: 200,
      centralFrequencyUnits: FREQUENCY_MHZ,
      continuumBandwidth: 150,
      continuumBandwidthUnits: FREQUENCY_MHZ,
      bandwidth: 5,
      numSubBands: 1,
      subarray: SA_AA2,
      type: TYPE_ZOOM,
      telescope: 0,
      linked: '',
      observingBand: BAND_LOW_STR,
      elevation: 0,
      supplied: { type: 0, value: 10, units: 0 },
      spectralResolution: '',
      effectiveResolution: '',
      ...overrides
    }
  ];

  it('displays spectral resolution from row value when type is spectral', () => {
    wrapper(
      <GridObservation
        data={makeObs({ 
          type: TYPE_ZOOM, 
          spectralResolution: '0.75 kHz' 
        })}
        rowClick={rowClickMock}
      />
    );
    expect(screen.getByText('Spectral Resolution: 0.75 kHz')).toBeInTheDocument();
  });

  it('displays hard-coded 5.43 kHz for continuum observations without spectral resolution', () => {
    wrapper(
      <GridObservation
        data={makeObs({ 
          type: TYPE_CONTINUUM, 
          spectralResolution: '' 
        })}
        rowClick={rowClickMock}
      />
    );
    expect(screen.getByText('Spectral Resolution: 5.43 kHz')).toBeInTheDocument();
  });

  it('displays hard-coded 3.62 kHz for PST observations without spectral resolution', () => {
    wrapper(
      <GridObservation
        data={makeObs({ 
          type: TYPE_PST, 
          spectralResolution: '' 
        })}
        rowClick={rowClickMock}
      />
    );
    expect(screen.getByText('Spectral Resolution: 3.62 kHz')).toBeInTheDocument();
  });
 });