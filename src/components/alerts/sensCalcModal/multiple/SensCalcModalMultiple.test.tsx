import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import SensCalcModalMultiple, { SensCalcRow } from './SensCalcModalMultiple';
import { SENSITIVITY_STATE } from '@/utils/constants';
import type { SensitivityValues } from '@/models/proposals/targetObservation';
import {
  newSvObservation,
  OBSERVING_MODE,
  type ObservationInput,
  type ObservingMode
} from '@/models/proposals/observations';
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

// The calculator gives only the weighted sensitivity for a custom subarray or a non-Gaussian beam
const weightedOnly = (weighted: number): SensitivityValues => ({
  weightedSensitivity: { value: weighted, unit: 'Jy' }
});
const WEIGHTED_ONLY_ROWS: SensCalcRow[] = [
  {
    id: 't1',
    title: 'M1',
    sensitivity: {
      state: SENSITIVITY_STATE.DONE,
      continuum: weightedOnly(1),
      spectral: weightedOnly(5)
    }
  }
];

const ZOOM_ROWS: SensCalcRow[] = [
  { id: 't1', title: 'M1', sensitivity: { state: SENSITIVITY_STATE.DONE, spectral: values(5) } }
];

const observation = (mode: ObservingMode): ObservationInput => ({
  ...newSvObservation(mode, 15),
  id: 'obs1',
  integrationTime: { value: 1.5, unit: 'h' }
});

const renderModal = (data: SensCalcRow[], mode: ObservingMode, { isCustom = false } = {}) =>
  render(
    <StoreProvider>
      <ThemeA11yProvider>
        <SensCalcModalMultiple
          open={true}
          onClose={vi.fn()}
          data={data}
          observation={observation(mode)}
          level={0}
          levelError={''}
          isCustom={isCustom}
        />
      </ThemeA11yProvider>
    </StoreProvider>
  );

describe('<SensCalcModalMultiple />', () => {
  test('shows the continuum and spectral results of a continuum observation', async () => {
    renderModal(CONTINUUM_ROWS, OBSERVING_MODE.CONTINUUM);

    await waitFor(() => {
      expect(screen.getByText('M1')).toBeInTheDocument();
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1.00 Jy');
      expect(screen.getByTestId('field-continuumSynthBeamSize')).toHaveTextContent('1.00 x 2.00');
      expect(screen.getByTestId('field-spectralSensitivityWeighted')).toHaveTextContent('5.00 Jy');
      expect(screen.getByTestId('field-integrationTime')).toHaveTextContent('1.5');
    });
  });

  test('shows only the spectral results of a zoom observation', async () => {
    renderModal(ZOOM_ROWS, OBSERVING_MODE.SPECTRAL);

    await waitFor(() => {
      expect(screen.getByTestId('field-spectralSensitivityWeighted')).toHaveTextContent('5.00 Jy');
    });
    expect(screen.queryByTestId('field-continuumSensitivityWeighted')).not.toBeInTheDocument();
  });

  test('shows only the continuum results of the combined mode', async () => {
    renderModal(CONTINUUM_ROWS, OBSERVING_MODE.CONTINUUM_SPECTRAL);

    await waitFor(() => {
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1.00 Jy');
    });
    expect(screen.queryByTestId('field-spectralSensitivityWeighted')).not.toBeInTheDocument();
  });

  test('shows the custom subarray message for the results the calculator did not give', async () => {
    renderModal(WEIGHTED_ONLY_ROWS, OBSERVING_MODE.CONTINUUM, { isCustom: true });

    await waitFor(() => {
      expect(screen.getByTestId('field-continuumConfusionNoise')).toHaveTextContent(
        'sensitivityCalculatorResults.customArray'
      );
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1.00 Jy');
    });
  });

  test('shows the non-Gaussian message for the results the calculator did not give', async () => {
    renderModal(WEIGHTED_ONLY_ROWS, OBSERVING_MODE.CONTINUUM);

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
      OBSERVING_MODE.CONTINUUM
    );

    await waitFor(() => {
      expect(screen.getByText('M1')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('field-continuumSensitivityWeighted')).not.toBeInTheDocument();
  });
});
