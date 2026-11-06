import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import SensCalcContent from './SensCalcContent';
import { SENSITIVITY_STATE } from '@/utils/constants';
import type { Sensitivity, SensitivityValues } from '@/models/proposals/targetObservation';

import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

vi.mock('i18next', () => ({
  t: (key: string) => key
}));

const link = (sensitivity: Sensitivity) => ({
  targetId: 't1',
  observationId: 'obs1',
  dataProductsSDPId: 'dp1',
  sensitivity
});

const values = (weighted: number): SensitivityValues => ({
  weightedSensitivity: { value: weighted, unit: 'Jy/beam' },
  totalSensitivity: { value: 3, unit: 'Jy/beam' },
  confusionNoise: { value: 2, unit: 'Jy/beam' },
  surfaceBrightnessSensitivity: { value: 4, unit: 'K' },
  synthesizedBeamSize: { value: '1.00 x 2.00', unit: 'arcsec²' }
});

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<SensCalcModalSingle />', () => {
  test('renders the no-target state when there is no target observation', () => {
    wrapper(<SensCalcContent />);

    expect(screen.getByText('sensitivityCalculatorResults.noTarget')).toBeInTheDocument();
  });

  test('renders the no-data state when results have not been calculated', () => {
    wrapper(<SensCalcContent targetObservation={{}} />);

    expect(screen.getByText('sensitivityCalculatorResults.noData')).toBeInTheDocument();
  });

  test('renders the calculating state, without results, while results are being calculated', () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          targetId: 'target-1',
          observationId: 'obs-1',
          dataProductsSDPId: 'dp-1',
          sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
        }}
      />
    );

    expect(screen.getByText('sensitivityCalculatorResults.calculating')).toBeInTheDocument();
    expect(screen.queryByText('sensitivityCalculatorResults.noData')).not.toBeInTheDocument();
  });

  test('renders correctly ( OK )', () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({
          state: SENSITIVITY_STATE.DONE,
          continuum: values(1),
          spectral: values(200)
        })}
        isNatural={false}
      />
    );

    expect(
      screen.getByLabelText('sensitivityCalculatorResults.continuumSensitivityWeighted')
    ).toHaveTextContent('1');
    expect(
      screen.getByLabelText('sensitivityCalculatorResults.spectralSensitivityWeighted')
    ).toHaveTextContent('200');
    expect(
      screen.getByLabelText('sensitivityCalculatorResults.spectralSynthBeamSize')
    ).toHaveTextContent('1.00 x 2.00');
  });
  test('renders correctly ( OK, zoom )', () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({ state: SENSITIVITY_STATE.DONE, spectral: values(50) })}
        isNatural={false}
      />
    );

    expect(
      screen.getByLabelText('sensitivityCalculatorResults.spectralSensitivityWeighted')
    ).toHaveTextContent('50');
    expect(
      screen.queryByText('sensitivityCalculatorResults.continuumSensitivityWeighted')
    ).not.toBeInTheDocument();
  });
  test('hides the spectral part of continuum results when asked', () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({
          state: SENSITIVITY_STATE.DONE,
          continuum: values(1),
          spectral: values(200)
        })}
        hideSpectralResults
      />
    );

    expect(
      screen.getByLabelText('sensitivityCalculatorResults.continuumSensitivityWeighted')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('sensitivityCalculatorResults.spectralSensitivityWeighted')
    ).not.toBeInTheDocument();
  });
  test('renders correctly ( OK, large value )', async () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({ state: SENSITIVITY_STATE.DONE, spectral: values(1052.5) })}
        isNatural={false}
      />
    );
    await waitFor(() => {
      expect(
        screen.getByLabelText('sensitivityCalculatorResults.spectralSensitivityWeighted')
      ).toHaveTextContent('1.1e+3');
    });
  });
  test('renders correctly ( OK, natural )', async () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({
          state: SENSITIVITY_STATE.DONE,
          continuum: values(7.18),
          spectral: values(1)
        })}
        isNatural={true}
      />
    );
    await waitFor(() => {
      // Only the weighted sensitivities are valid for a non-Gaussian beam
      expect(
        screen.getByLabelText('sensitivityCalculatorResults.continuumConfusionNoise')
      ).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');
      expect(
        screen.getByLabelText('sensitivityCalculatorResults.continuumSensitivityWeighted')
      ).toHaveTextContent('7.18');
    });
  });
  test('renders correctly (error)', () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({ state: SENSITIVITY_STATE.FAILED, error: 'SOME ERROR' })}
        isNatural={false}
      />
    );
  });
});
