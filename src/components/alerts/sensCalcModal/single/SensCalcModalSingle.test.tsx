import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SensCalcModalSingle from './SensCalcModalSingle';
import { STATUS_ERROR, STATUS_INITIAL } from '@/utils/constants';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

vi.mock('i18next', () => ({
  t: (key: string) => key
}));

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<SensCalcModalSingle />', () => {
  test('renders correctly ( INITIAL )', () => {
    wrapper(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: '',
          statusGUI: STATUS_INITIAL,
          error: undefined,
          section1: undefined,
          section2: undefined,
          section3: undefined
        }}
        isCustom={false}
        isNatural={false}
      />
    );
  });
  test('renders correctly ( OK )', () => {
    wrapper(
      <SensCalcModalSingle
        open={true}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: 'm1',
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
          ],
          section3: [
            {
              field: 'testField3',
              value: '2',
              units: 'testUnits3'
            }
          ]
        }}
        isCustom={false}
        isNatural={false}
      />
    );
    const target = screen.getByTestId('field-targetName');
    expect(target).toBeInTheDocument();
    expect(target).toHaveTextContent('m1');

    const element1 = screen.getByTestId('field-testField1');
    expect(element1).toBeInTheDocument();
    expect(element1).toHaveTextContent('1');

    screen.debug();
    const element2 = screen.getByTestId('field-sensitivity');
    expect(element2).toBeInTheDocument();
    expect(element2).toHaveTextContent('200');

    const element3 = screen.getByTestId('field-testField2');
    expect(element3).toBeInTheDocument();
    expect(element3).toHaveTextContent('50');

    const element4 = screen.getByTestId('field-testField3');
    expect(element4).toBeInTheDocument();
    expect(element4).toHaveTextContent('2');
  });
  test('renders correctly ( OK, custom )', async () => {
    wrapper(
      <SensCalcModalSingle
        open={true}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: 'm2',
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
          ],
          section3: [
            {
              field: 'customField2',
              value: 'customValue2',
              units: 'testUnits3'
            }
          ]
        }}
        isCustom={true}
        isNatural={false}
      />
    );
    await waitFor(() => {
      const target = screen.getByTestId('field-targetName');
      expect(target).toBeInTheDocument();
      expect(target).toHaveTextContent('m2');

      const element1 = screen.getByTestId('field-customField1');
      expect(element1).toBeInTheDocument();
      expect(element1).toHaveTextContent('sensitivityCalculatorResults.custom');

      const element2 = screen.getByTestId('field-sensitivity');
      expect(element2).toBeInTheDocument();
      expect(element2).toHaveTextContent('1.1e+3');

      const element3 = screen.getByTestId('field-customField2');
      expect(element3).toBeInTheDocument();
      expect(element3).toHaveTextContent('sensitivityCalculatorResults.custom');
    });
  });
  test('renders correctly ( OK, natural )', async () => {
    wrapper(
      <SensCalcModalSingle
        open={true}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: 'm2',
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
              units: 'jy/beam'
            }
          ],
          section3: [
            {
              field: 'naturalField2',
              value: 'naturalValue2',
              units: 'testUnits3'
            }
          ]
        }}
        isCustom={false}
        isNatural={true}
      />
    );
    await waitFor(() => {
      const target = screen.getByTestId('field-targetName');
      expect(target).toBeInTheDocument();
      expect(target).toHaveTextContent('m2');

      const element1 = screen.getByTestId('field-naturalField1');
      expect(element1).toBeInTheDocument();
      expect(element1).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element2 = screen.getByTestId('field-integrationTime');
      expect(element2).toBeInTheDocument();
      expect(element2).toHaveTextContent('1');

      const element3 = screen.getByTestId('field-continuumSensitivityWeighted');
      expect(element3).toBeInTheDocument();
      expect(element3).toHaveTextContent('7.18');

      const element4 = screen.getByTestId('field-naturalField2');
      expect(element4).toBeInTheDocument();
      expect(element4).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');
    });
  });
  test('renders correctly (error)', () => {
    wrapper(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: '',
          statusGUI: STATUS_ERROR,
          error: 'SOME ERROR',
          section1: undefined,
          section2: undefined,
          section3: undefined
        }}
        isCustom={true}
        isNatural={false}
      />
    );
  });
});
