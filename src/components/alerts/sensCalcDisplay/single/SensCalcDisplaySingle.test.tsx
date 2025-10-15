import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SensCalcDisplaySingle from './SensCalcDisplaySingle';
import { STATUS_INITIAL, STATUS_OK } from '@/utils/constants';

vi.mock('i18next', () => ({
  t: (key: string) => key
}));

describe('<SensCalcDisplaySingle />', () => {
  test('renders correctly', () => {
    render(<SensCalcDisplaySingle sensCalc={undefined} field={''} />);
  });
  test('renders correctly ( icon )', () => {
    render(<SensCalcDisplaySingle sensCalc={{ statusGUI: STATUS_INITIAL }} show field={'icon'} />);
  });
  test('renders correctly ( icon )', () => {
    render(<SensCalcDisplaySingle sensCalc={{ statusGUI: STATUS_OK }} show field={'icon'} />);
  });
  test('renders correctly ( field )', () => {
    render(
      <SensCalcDisplaySingle
        sensCalc={{
          statusGUI: STATUS_OK,
          section1: [
            {
              field: 'targetName',
              value: 'testValue',
              units: 'testUnits'
            },
            {
              field: 'testField1',
              value: 'testValue1',
              units: 'testUnits1'
            }
          ],
          section2: [
            {
              field: 'sensitivity',
              value: 'testValue2',
              units: 'testUnits2'
            },
            {
              field: 'testField2',
              value: 'testValue2',
              units: 'testUnits2'
            }
          ],
          section3: [
            {
              field: 'testField3',
              value: 'testValue3',
              units: 'testUnits3'
            }
          ]
        }}
        show
        field={'field'}
      />
    );
  });
  test('renders correctly ( icon, custom )', () => {
    render(
      <SensCalcDisplaySingle sensCalc={{ statusGUI: STATUS_OK }} show field={'icon'} isCustom />
    );
  });
  test('renders correctly ( field, custom )', () => {
    render(
      <SensCalcDisplaySingle
        sensCalc={{
          statusGUI: STATUS_OK,
          section1: [
            {
              field: 'targetName',
              value: 'testValue',
              units: 'testUnits'
            },
            {
              field: 'testField1',
              value: 'testValue1',
              units: 'testUnits1'
            }
          ],
          section2: [
            {
              field: 'sensitivity',
              value: 'testValue2',
              units: 'testUnits2'
            },
            {
              field: 'testField2',
              value: 'testValue2',
              units: 'testUnits2'
            }
          ],
          section3: [
            {
              field: 'testField3',
              value: 'testValue3',
              units: 'testUnits3'
            }
          ]
        }}
        show
        field={'field'}
        isCustom
      />
    );
  });

  test('renders correctly ( icon, natural )', async () => {
    render(
      <SensCalcDisplaySingle sensCalc={{ statusGUI: STATUS_OK }} show field={'icon'} isNatural />
    );
  });

  test('renders correctly ( field, natural )', async () => {
    render(
      <SensCalcDisplaySingle
        sensCalc={{
          statusGUI: STATUS_OK,
          section1: [
            {
              field: 'targetName',
              value: 'testValue',
              units: 'testUnits'
            },
            {
              field: 'testField1',
              value: 'testValue1',
              units: 'testUnits1'
            }
          ],
          section2: [
            {
              field: 'sensitivity',
              value: 'testValue2',
              units: 'testUnits2'
            },
            {
              field: 'testField2',
              value: 'testValue2',
              units: 'testUnits2'
            }
          ],
          section3: [
            {
              field: 'testField3',
              value: 'testValue3',
              units: 'testUnits3'
            }
          ]
        }}
        show={true}
        field={'SynthBeamSize'}
        isNatural={true}
      />
    );

    await waitFor(() => {
      const element = screen.getByTestId('field-SynthBeamSize');
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');
    });
  });
});
