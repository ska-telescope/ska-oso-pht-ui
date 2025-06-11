import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SensCalcModalSingle from './SensCalcModalSingle';
import { STATUS_ERROR, STATUS_INITIAL } from '@/utils/constants';

describe('<SensCalcModalSingle />', () => {
  test('renders correctly ( INITIAL )', () => {
    render(
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
      />
    );
  });
  test('renders correctly ( OK )', () => {
    render(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: '',
          statusGUI: 0,
          error: undefined,
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
              field: 'testField1',
              value: 'testValue1',
              units: 'testUnits1'
            }
          ],
          section3: [
            {
              field: 'testField1',
              value: 'testValue1',
              units: 'testUnits1'
            }
          ]
        }}
        isCustom={false}
      />
    );
  });
  test('renders correctly ( OK, custom )', () => {
    render(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: '',
          statusGUI: 0,
          error: undefined,
          section1: [
            {
              field: 'targetName',
              value: 'testValue1',
              units: 'testUnits1'
            }
          ],
          section2: [
            {
              field: 'sensitivity',
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
        isCustom={true}
      />
    );
  });
  test('renders correctly (error)', () => {
    render(
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
      />
    );
  });
});
