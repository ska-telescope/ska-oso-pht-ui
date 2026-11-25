import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SensCalcDisplaySingle from './SensCalcDisplaySingle';
import { SENSITIVITY_STATE } from '@/utils/constants';
import TargetObservation from '@utils/types/targetObservation.tsx';
import type { Sensitivity, SensitivityValues } from '@/models/proposals/targetObservation';

vi.mock('i18next', () => ({
  t: (key: string) => key
}));

// Stub out the modal so opening it can be asserted on without needing the
// providers (store/theme) its own internals depend on.
vi.mock('../../sensCalcModal/single/SensCalcModalSingle', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="sensCalcModal" /> : null)
}));

const buildTargetObservation = (sensitivity: Sensitivity): TargetObservation => ({
  targetId: 't1',
  observationId: 'obs1',
  dataProductsSDPId: 'dp1',
  sensitivity
});

const values = (weighted: number): SensitivityValues => ({
  weightedSensitivity: { value: weighted, unit: 'Jy' },
  totalSensitivity: { value: 1, unit: 'Jy' },
  confusionNoise: { value: 1, unit: 'Jy' },
  surfaceBrightnessSensitivity: { value: 1, unit: 'K' },
  synthesizedBeamSize: { value: '1.00 x 2.00', unit: 'arcsec²' }
});

const DONE: Sensitivity = { state: SENSITIVITY_STATE.DONE, spectral: values(1) };

// The calculator gives only the weighted sensitivity
// for a custom subarray or a non-Gaussian beam
const NO_BEAM: Sensitivity = {
  state: SENSITIVITY_STATE.DONE,
  spectral: { weightedSensitivity: { value: 1, unit: 'Jy' } }
};

describe('<SensCalcDisplaySingle />', () => {
  test('renders nothing when show is false', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation(DONE)}
        show={false}
        field="icon"
      />
    );
    expect(screen.queryByTestId('statusId')).not.toBeInTheDocument();
    expect(screen.queryByTestId('field-icon')).not.toBeInTheDocument();
  });

  test('renders an enabled icon when status is OK, and opens the modal on click', () => {
    render(
      <SensCalcDisplaySingle targetObservation={buildTargetObservation(DONE)} show field="icon" />
    );
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(screen.queryByTestId('sensCalcModal')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByTestId('sensCalcModal')).toBeInTheDocument();
  });

  test('renders a disabled icon when status is not OK, and click does not open the modal', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          state: SENSITIVITY_STATE.FAILED,
          error: 'Bandwidth too small'
        })}
        show
        field="icon"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(screen.queryByTestId('sensCalcModal')).not.toBeInTheDocument();
  });

  test('renders the continuum value of a continuum observation', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          state: SENSITIVITY_STATE.DONE,
          continuum: values(42.5),
          spectral: values(1)
        })}
        show
        field="SensitivityWeighted"
      />
    );
    expect(screen.getByTestId('field-SensitivityWeighted')).toHaveTextContent('42.50 Jy');
  });

  test('renders the spectral value of a zoom observation', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          state: SENSITIVITY_STATE.DONE,
          spectral: values(42.5)
        })}
        show
        field="SensitivityWeighted"
      />
    );
    expect(screen.getByTestId('field-SensitivityWeighted')).toHaveTextContent('42.50 Jy');
  });

  test('renders blank for a field that is not a result', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation(DONE)}
        show
        field="testField"
      />
    );
    expect(screen.getByTestId('field-testField')).toHaveTextContent(/^$/);
  });

  test('renders the custom subarray message for a result the calculator did not give', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation(NO_BEAM)}
        show
        field="SynthBeamSize"
        isCustom
      />
    );
    expect(screen.getByTestId('field-SynthBeamSize')).toHaveTextContent(
      'sensitivityCalculatorResults.customArray'
    );
  });

  test('renders the non-Gaussian message for a result the calculator did not give', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation(NO_BEAM)}
        show
        field="SynthBeamSize"
      />
    );
    expect(screen.getByTestId('field-SynthBeamSize')).toHaveTextContent(
      'sensitivityCalculatorResults.nonGaussian'
    );
  });

  test('renders the value of a result the calculator gave, whatever the subarray', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation(DONE)}
        show
        field="SynthBeamSize"
        isCustom
      />
    );
    expect(screen.getByTestId('field-SynthBeamSize')).toHaveTextContent('1.00 x 2.00');
  });
});
