import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import { MockProposalFrontend } from '@/services/axios/get/getProposal/mockProposalFrontend';
import SensCalcModalSingle from './SensCalcModalSingle';
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { ProposalSeed } from '@/models/proposals/useProposalForm';
import { SENSITIVITY_STATE } from '@/utils/constants';
import type { Sensitivity, SensitivityValues } from '@/models/proposals/targetObservation';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

vi.mock('i18next', () => ({
  t: (key: string) => key
}));

const link = (sensitivity: Sensitivity) => ({
  targetId: 't1',
  observationId: 'obs-obR1Ej',
  dataProductsSDPId: 'SDP-2',
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
      <TestProposalFormProvider proposal={MockProposalFrontend as unknown as ProposalSeed}>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </TestProposalFormProvider>
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
      />
    );

    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1');
    expect(screen.getByTestId('field-spectralSensitivityWeighted')).toHaveTextContent('200');
  });
  test('renders correctly (error)', () => {
    wrapper(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        targetObservation={link({ state: SENSITIVITY_STATE.FAILED, error: 'SOME ERROR' })}
      />
    );
  });
});
