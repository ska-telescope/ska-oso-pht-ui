import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SensCalcContent from './SensCalcContent';
import { STATUS_ERROR, STATUS_INITIAL } from '@/utils/constants';

import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

vi.mock('i18next', () => ({
  t: (key: string) => key
}));

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<SensCalcModalSingle />', () => {
  test('renders the no-data state when results have not been calculated', () => {
    wrapper(<SensCalcContent />);

    expect(screen.getByText('sensitivityCalculatorResults.noData')).toBeInTheDocument();
  });

  test('renders correctly ( INITIAL )', () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          sensCalc: {
            statusGUI: STATUS_INITIAL,
            error: undefined,
            section1: undefined,
            section2: undefined
          }
        }}
        isNatural={false}
      />
    );
  });
  test('renders correctly ( OK )', () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          sensCalc: {
            statusGUI: 0,
            error: undefined,
            section1: [
              {
                field: 'testField1',
                value: '1',
                units: 'testUnits1'
              }
            ],
            section2: [
              {
                field: 'sensitivity',
                value: '200',
                units: 'testUnits2'
              },
              {
                field: 'testField2',
                value: '50',
                units: 'testUnits2'
              }
            ]
          }
        }}
        isNatural={false}
      />
    );

    const element1 = screen.getByTestId('field-testField1');
    expect(element1).toBeInTheDocument();
    expect(element1).toHaveTextContent('1');

    const element2 = screen.getByTestId('field-sensitivity');
    expect(element2).toBeInTheDocument();
    expect(element2).toHaveTextContent('200');

    const element3 = screen.getByTestId('field-testField2');
    expect(element3).toBeInTheDocument();
    expect(element3).toHaveTextContent('50');
  });
  test('renders correctly ( OK, custom )', async () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          sensCalc: {
            statusGUI: 0,
            error: undefined,
            section1: [
              {
                field: 'customField1',
                value: 'customValue1',
                units: 'testUnits'
              }
            ],
            section2: [
              {
                field: 'sensitivity',
                value: '1052.5',
                units: 'Jy/beam'
              }
            ]
          }
        }}
        isNatural={false}
      />
    );
    await waitFor(() => {
      const element2 = screen.getByTestId('field-sensitivity');
      expect(element2).toBeInTheDocument();
      expect(element2).toHaveTextContent('1.1e+3');
    });
  });
  test('renders correctly ( OK, natural )', async () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          sensCalc: {
            statusGUI: 0,
            error: undefined,
            section1: [
              {
                field: 'naturalField1',
                value: 'naturalValue1',
                units: 'testUnits'
              }
            ],
            section2: [
              {
                field: 'integrationTime',
                value: '1',
                units: 'h'
              },
              {
                field: 'continuumSensitivityWeighted',
                value: '7.18',
                units: 'Jy/beam'
              }
            ]
          }
        }}
        isNatural={true}
      />
    );
    await waitFor(() => {
      const element1 = screen.getByTestId('field-naturalField1');
      expect(element1).toBeInTheDocument();
      expect(element1).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element3 = screen.getByTestId('field-continuumSensitivityWeighted');
      expect(element3).toBeInTheDocument();
      expect(element3).toHaveTextContent('7.18');
    });
  });
  test('renders correctly (error)', () => {
    wrapper(
      <SensCalcContent
        targetObservation={{
          sensCalc: {
            statusGUI: STATUS_ERROR,
            error: 'SOME ERROR',
            section1: undefined,
            section2: undefined
          }
        }}
        isNatural={false}
      />
    );
  });
});
