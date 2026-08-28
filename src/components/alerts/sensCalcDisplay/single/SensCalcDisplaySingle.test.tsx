import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SensCalcDisplaySingle from './SensCalcDisplaySingle';
import { STATUS_OK, STATUS_ERROR, TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constants';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { SensCalcResults } from '@/utils/types/sensCalcResults';

vi.mock('i18next', () => ({
  t: (key: string) => key
}));

// Stub out the modal so opening it can be asserted on without needing the
// providers (store/theme) its own internals depend on.
vi.mock('../../sensCalcModal/single/SensCalcModalSingle', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="sensCalcModal" /> : null)
}));

const buildTargetObservation = (sensCalc: Partial<SensCalcResults>): TargetObservation =>
  ({
    sensCalc: { statusGUI: STATUS_OK, ...sensCalc }
  }) as TargetObservation;

describe('<SensCalcDisplaySingle />', () => {
  test('renders nothing when show is false', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({})}
        show={false}
        field="icon"
      />
    );
    expect(screen.queryByTestId('statusId')).not.toBeInTheDocument();
    expect(screen.queryByTestId('field-icon')).not.toBeInTheDocument();
  });

  test('renders an enabled icon when status is OK, and opens the modal on click', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({ statusGUI: STATUS_OK })}
        show
        field="icon"
      />
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
        targetObservation={buildTargetObservation({ statusGUI: STATUS_ERROR })}
        show
        field="icon"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(screen.queryByTestId('sensCalcModal')).not.toBeInTheDocument();
  });

  test('renders the value and units for a matching continuum field', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          section1: [{ field: `${TYPE_CONTINUUM}testField`, value: '42.5', units: 'Jy' }],
          section2: [{ field: 'sensitivity', value: '1', units: 'Jy' }]
        })}
        show
        field="testField"
      />
    );
    expect(screen.getByTestId('field-testField')).toHaveTextContent('42.50 Jy');
  });

  test('renders the value and units for a matching zoom field when section2 is empty', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          section1: [{ field: `${TYPE_ZOOM}testField`, value: '42.5', units: 'Jy' }],
          section2: []
        })}
        show
        field="testField"
      />
    );
    expect(screen.getByTestId('field-testField')).toHaveTextContent('42.50 Jy');
  });

  test('renders blank when no section1 entry matches the field', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          section1: [{ field: `${TYPE_CONTINUUM}otherField`, value: '42.5', units: 'Jy' }],
          section2: [{ field: 'sensitivity', value: '1', units: 'Jy' }]
        })}
        show
        field="testField"
      />
    );
    expect(screen.getByTestId('field-testField')).toHaveTextContent('0');
  });

  test('renders the custom placeholder instead of the value for SynthBeamSize when isCustom', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          section1: [{ field: `${TYPE_CONTINUUM}SynthBeamSize`, value: '42.5', units: 'Jy' }],
          section2: [{ field: 'sensitivity', value: '1', units: 'Jy' }]
        })}
        show
        field="SynthBeamSize"
        isCustom
      />
    );
    expect(screen.getByTestId('field-SynthBeamSize')).toHaveTextContent(
      'sensitivityCalculatorResults.customArray'
    );
  });

  test('renders the non-Gaussian placeholder instead of the value for SynthBeamSize when isNatural', () => {
    render(
      <SensCalcDisplaySingle
        targetObservation={buildTargetObservation({
          section1: [{ field: `${TYPE_CONTINUUM}SynthBeamSize`, value: '42.5', units: 'Jy' }],
          section2: [{ field: 'sensitivity', value: '1', units: 'Jy' }]
        })}
        show
        field="SynthBeamSize"
        isNatural
      />
    );
    expect(screen.getByTestId('field-SynthBeamSize')).toHaveTextContent(
      'sensitivityCalculatorResults.nonGaussian'
    );
  });
});
