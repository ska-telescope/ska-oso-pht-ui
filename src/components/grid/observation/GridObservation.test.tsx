import { describe, it, expect, vi, beforeEach, beforeAll, type Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StoreProvider } from '@utils/storage/store';
import GridObservation from './GridObservation';
import {
  newSvObservation,
  OBSERVING_MODE,
  spectralResolutionText,
  TELESCOPE,
  type ObservationInput
} from '@/models/proposals/observations';

// Mock ResizeObserver for test environment
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

const observation = (id: string, mode: ObservationInput['observingMode']): ObservationInput => ({
  ...newSvObservation(mode, 15),
  id
});

const mockData = [
  observation('OBS001', OBSERVING_MODE.CONTINUUM),
  observation('OBS002', OBSERVING_MODE.SPECTRAL)
];

const theme = createTheme();

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </StoreProvider>
  );
};

// The text of a line, with its label and value, as one string
const line = (text: string) =>
  screen.queryByText(
    (_, element) => (element?.textContent ?? '').replace(/\s+/g, ' ').trim() === text
  );

let rowClickMock: Mock<(params: unknown) => void>;

beforeEach(() => {
  rowClickMock = vi.fn();
});

describe('GridObservation', () => {
  it('displays a row for each observation', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(screen.getByTestId('gridObservation')).toBeInTheDocument();
    expect(screen.getByText('OBS001')).toBeInTheDocument();
    expect(screen.getByText('OBS002')).toBeInTheDocument();
  });

  it('shows the central frequency and integration time with their units', () => {
    wrapper(
      <GridObservation
        data={[
          {
            ...mockData[0],
            centralFrequency: { value: 1400, unit: 'MHz' },
            integrationTime: { value: 30, unit: 'min' }
          } as ObservationInput
        ]}
        rowClick={rowClickMock}
      />
    );
    expect(line('Central Frequency: 1400 MHz')).toBeInTheDocument();
    expect(line('Integration Time: 30 min')).toBeInTheDocument();
  });

  it('shows a dash for a missing value', () => {
    wrapper(
      <GridObservation
        data={[{ ...mockData[0], integrationTime: { value: null, unit: 'h' } }]}
        rowClick={rowClickMock}
      />
    );
    expect(line('Integration Time: -')).toBeInTheDocument();
  });
});

describe('GridObservation spectral resolution', () => {
  it("shows a spectral line observation's resolution from its zoom factor", () => {
    wrapper(<GridObservation data={[mockData[1]]} rowClick={rowClickMock} />);
    const spectral = mockData[1] as Extract<ObservationInput, { zoomFactor: unknown }>;
    expect(
      line(
        `Spectral Resolution: ${spectralResolutionText(
          TELESCOPE.LOW,
          spectral.zoomFactor as number,
          spectral.centralFrequency
        )}`
      )
    ).toBeInTheDocument();
  });

  it.each([
    [OBSERVING_MODE.CONTINUUM, '5.43 kHz'],
    [OBSERVING_MODE.PST, '3.62 kHz']
  ])('shows the fixed resolution of %s', (mode, resolution) => {
    wrapper(<GridObservation data={[observation('OBS', mode)]} rowClick={rowClickMock} />);
    expect(line(`Spectral Resolution: ${resolution}`)).toBeInTheDocument();
  });

  it('shows none for a spectral line observation without a zoom factor', () => {
    wrapper(
      <GridObservation
        data={[{ ...mockData[1], zoomFactor: null } as ObservationInput]}
        rowClick={rowClickMock}
      />
    );
    expect(screen.queryByText(/Spectral Resolution:/)).not.toBeInTheDocument();
  });
});

describe('GridObservation selection', () => {
  it('selects the first row on initial render', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[0] });
  });

  it('calls rowClick when a row is clicked', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
    fireEvent.click(screen.getByText('OBS002'));
    expect(rowClickMock).toHaveBeenCalledWith(expect.objectContaining({ row: mockData[1] }));
  });

  it('prioritizes autoSelectId over first row auto-select', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} autoSelectId="OBS002" />);
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[1] });
  });

  it('falls back to first row when autoSelectId does not exist in data', () => {
    wrapper(
      <GridObservation data={mockData} rowClick={rowClickMock} autoSelectId="NON_EXISTENT" />
    );
    expect(rowClickMock).toHaveBeenCalledWith({ row: mockData[0] });
  });

  it('only auto-selects once even with data updates', () => {
    const { rerender } = wrapper(<GridObservation data={mockData} rowClick={rowClickMock} />);
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

  it('does not call rowClick when disabled', () => {
    wrapper(<GridObservation data={mockData} rowClick={rowClickMock} disabled />);
    const calls = rowClickMock.mock.calls.length;

    fireEvent.click(screen.getByText('OBS002'));

    expect(rowClickMock).toHaveBeenCalledTimes(calls);
  });
});
