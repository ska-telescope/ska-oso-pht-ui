import { beforeEach, describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormProvider } from 'react-hook-form';
import { storageObject, StoreProvider } from '@utils/storage/store';
import completeMockStore from '@/utils/MockStore';
import { MockProposalFrontend } from '@/services/axios/get/getProposal/mockProposalFrontend';
import SensCalcContent from './SensCalcContent';
import { useProposalForm } from '@/models/proposals/useProposalForm';
import type { ProposalType } from '@/models/proposals/proposal';
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

// The linked target lives in the form, which owns the targets
const FormWithTarget = ({ children }: { children: React.ReactNode }) => {
  const form = useProposalForm({
    id: 'p1',
    targets: [{ id: 't1', name: 'Target A' }] as ProposalType['targets']
  });
  return <FormProvider {...form}>{children}</FormProvider>;
};

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <FormWithTarget>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </FormWithTarget>
    </StoreProvider>
  );
};

describe('<SensCalcModalSingle />', () => {
  // The linked observation and data product are still read from the store
  beforeEach(() => {
    vi.spyOn(storageObject, 'useStore').mockReturnValue({
      ...completeMockStore,
      application: { ...completeMockStore.application, content2: MockProposalFrontend }
    } as unknown as ReturnType<typeof storageObject.useStore>);
  });

  test('renders the no-data state when results have not been calculated', () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          targetId: 't1',
          observationId: 'obs-obR1Ej',
          dataProductsSDPId: 'SDP-2'
        }}
      />
    );

    expect(screen.getByText('sensitivityCalculatorResults.noData')).toBeInTheDocument();
  });

  test('renders the calculating state, without results, while results are being calculated', () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          targetId: 'target-1',
          observationId: 'obs-obR1Ej',
          dataProductsSDPId: 'SDP-2',
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
  test('shows the name of the linked target from the form', () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({ state: SENSITIVITY_STATE.DONE, spectral: values(50) })}
      />
    );

    expect(screen.getByTestId('field-targetName')).toHaveTextContent('Target A');
  });
  test('renders correctly ( OK, zoom )', () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({ state: SENSITIVITY_STATE.DONE, spectral: values(50) })}
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
      />
    );
    await waitFor(() => {
      expect(
        screen.getByLabelText('sensitivityCalculatorResults.spectralSensitivityWeighted')
      ).toHaveTextContent('1.1e+3');
    });
  });
  test('renders the non-Gaussian message for the results the calculator did not give', async () => {
    // For a non-Gaussian beam, the calculator gives only the weighted sensitivities
    const weightedOnly = (weighted: number): SensitivityValues => ({
      weightedSensitivity: { value: weighted, unit: 'Jy/beam' }
    });
    wrapper(
      <SensCalcContent
        targetObservation={link({
          state: SENSITIVITY_STATE.DONE,
          continuum: weightedOnly(7.18),
          spectral: weightedOnly(1)
        })}
      />
    );
    await waitFor(() => {
      expect(
        screen.getByLabelText('sensitivityCalculatorResults.continuumSensitivityWeighted')
      ).toHaveTextContent('7.18');
      expect(
        screen.getByLabelText('sensitivityCalculatorResults.spectralSensitivityWeighted')
      ).toHaveTextContent('1');
      [
        'continuumConfusionNoise',
        'continuumTotalSensitivity',
        'continuumSynthBeamSize',
        'continuumSurfaceBrightnessSensitivity',
        'spectralConfusionNoise',
        'spectralTotalSensitivity',
        'spectralSynthBeamSize',
        'spectralSurfaceBrightnessSensitivity'
      ].forEach((field) =>
        expect(screen.getByLabelText(`sensitivityCalculatorResults.${field}`)).toHaveTextContent(
          'sensitivityCalculatorResults.nonGaussian'
        )
      );
    });
  });
  test('renders correctly (error)', () => {
    wrapper(
      <SensCalcContent
        targetObservation={link({ state: SENSITIVITY_STATE.FAILED, error: 'SOME ERROR' })}
      />
    );
  });
});
