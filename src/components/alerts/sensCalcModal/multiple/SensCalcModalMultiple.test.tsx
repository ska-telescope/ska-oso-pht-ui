import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import SensCalcModalMultiple, { SensCalcRow } from './SensCalcModalMultiple';
import {
  BAND_LOW_STR,
  SENSITIVITY_STATE,
  TIME_HOURS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_ZOOM
} from '@/utils/constants';
import type { SensitivityValues } from '@/models/proposals/targetObservation';
import type Observation from '@/utils/types/observation';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const values = (weighted: number): SensitivityValues => ({
  weightedSensitivity: { value: weighted, unit: 'Jy' },
  totalSensitivity: { value: 3, unit: 'Jy' },
  confusionNoise: { value: 2, unit: 'Jy' },
  surfaceBrightnessSensitivity: { value: 4, unit: 'K' },
  synthesizedBeamSize: { value: '1.00 x 2.00', unit: 'arcsec²' }
});

const CONTINUUM_ROWS: SensCalcRow[] = [
  {
    id: 't1',
    title: 'M1',
    sensitivity: { state: SENSITIVITY_STATE.DONE, continuum: values(1), spectral: values(5) }
  }
];

const ZOOM_ROWS: SensCalcRow[] = [
  { id: 't1', title: 'M1', sensitivity: { state: SENSITIVITY_STATE.DONE, spectral: values(5) } }
];

const observation = (type: string): Observation => ({
  id: 'obs1',
  telescope: 0,
  subarray: '',
  type,
  observingBand: BAND_LOW_STR,
  weather: undefined,
  elevation: 0,
  centralFrequency: 0,
  centralFrequencyUnits: 0,
  bandwidth: 0,
  continuumBandwidth: 0,
  continuumBandwidthUnits: 0,
  supplied: { type: 0, value: 1.5, units: TIME_HOURS },
  spectralResolution: '',
  effectiveResolution: '',
  numSubBands: undefined,
  num15mAntennas: undefined,
  num13mAntennas: undefined,
  numStations: undefined
});

const renderModal = (
  data: SensCalcRow[],
  type: string,
  { isCustom = false, isNatural = false } = {}
) =>
  render(
    <StoreProvider>
      <ThemeA11yProvider>
        <SensCalcModalMultiple
          open={true}
          onClose={vi.fn()}
          data={data}
          observation={observation(type)}
          level={0}
          levelError={''}
          isCustom={isCustom}
          isNatural={isNatural}
        />
      </ThemeA11yProvider>
    </StoreProvider>
  );

describe('<SensCalcModalMultiple />', () => {
  test('shows the continuum and spectral results of a continuum observation', async () => {
    renderModal(CONTINUUM_ROWS, TYPE_CONTINUUM);

    await waitFor(() => {
      expect(screen.getByText('M1')).toBeInTheDocument();
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1.00 Jy');
      expect(screen.getByTestId('field-continuumSynthBeamSize')).toHaveTextContent('1.00 x 2.00');
      expect(screen.getByTestId('field-spectralSensitivityWeighted')).toHaveTextContent('5.00 Jy');
      expect(screen.getByTestId('field-integrationTime')).toHaveTextContent('1.5');
    });
  });

  test('shows only the spectral results of a zoom observation', async () => {
    renderModal(ZOOM_ROWS, TYPE_ZOOM);

    await waitFor(() => {
      expect(screen.getByTestId('field-spectralSensitivityWeighted')).toHaveTextContent('5.00 Jy');
    });
    expect(screen.queryByTestId('field-continuumSensitivityWeighted')).not.toBeInTheDocument();
  });

  test('shows only the continuum results of the combined mode', async () => {
    renderModal(CONTINUUM_ROWS, TYPE_CONTINUUM_SPECTRAL);

    await waitFor(() => {
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1.00 Jy');
    });
    expect(screen.queryByTestId('field-spectralSensitivityWeighted')).not.toBeInTheDocument();
  });

  test('shows the custom array placeholder for the values not valid for one', async () => {
    renderModal(CONTINUUM_ROWS, TYPE_CONTINUUM, { isCustom: true });

    await waitFor(() => {
      expect(screen.getByTestId('field-continuumConfusionNoise')).toHaveTextContent(
        'sensitivityCalculatorResults.customArray'
      );
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1.00 Jy');
    });
  });

  test('shows the non-Gaussian placeholder for the values not valid for a natural beam', async () => {
    renderModal(CONTINUUM_ROWS, TYPE_CONTINUUM, { isNatural: true });

    await waitFor(() => {
      expect(screen.getByTestId('field-spectralTotalSensitivity')).toHaveTextContent(
        'sensitivityCalculatorResults.nonGaussian'
      );
      expect(screen.getByTestId('field-integrationTime')).toHaveTextContent('1.5');
    });
  });

  test('shows no result columns when no link has results', async () => {
    renderModal(
      [{ id: 't1', title: 'M1', sensitivity: { state: SENSITIVITY_STATE.FAILED, error: 'bad' } }],
      TYPE_CONTINUUM
    );

    await waitFor(() => {
      expect(screen.getByText('M1')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('field-continuumSensitivityWeighted')).not.toBeInTheDocument();
  });
});
