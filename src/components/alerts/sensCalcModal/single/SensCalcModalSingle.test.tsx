import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import SensCalcModalSingle from './SensCalcModalSingle';
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
  test('renders correctly ( calculating )', () => {
    wrapper(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        targetObservation={link({ state: SENSITIVITY_STATE.CALCULATING })}
        isNatural={false}
      />
    );
  });
  test('renders correctly ( OK )', () => {
    wrapper(
      <SensCalcModalSingle
        open={true}
        onClose={vi.fn()}
        targetObservation={link({
          state: SENSITIVITY_STATE.DONE,
          continuum: values(1),
          spectral: values(200)
        })}
        isNatural={false}
      />
    );

    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1');
    expect(screen.getByTestId('field-spectralSensitivityWeighted')).toHaveTextContent('200');
  });
  test('renders correctly ( OK, natural )', async () => {
    wrapper(
      <SensCalcModalSingle
        open={true}
        onClose={vi.fn()}
        targetObservation={link({
          state: SENSITIVITY_STATE.DONE,
          continuum: values(7.18),
          spectral: values(1)
        })}
        isNatural={true}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('field-continuumConfusionNoise')).toHaveTextContent(
        'sensitivityCalculatorResults.nonGaussian'
      );
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('7.18');
    });
  });
  test('renders correctly (error)', () => {
    wrapper(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        targetObservation={link({ state: SENSITIVITY_STATE.FAILED, error: 'SOME ERROR' })}
        isNatural={false}
      />
    );
  });
});
