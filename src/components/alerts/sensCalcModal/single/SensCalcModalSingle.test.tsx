import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SensCalcModalSingle from './SensCalcModalSingle';

describe('<SensCalcModalSingle />', () => {
  test('renders correctly', () => {
    render(
      <SensCalcModalSingle
        open={false}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: '',
          statusGUI: 0,
          error: undefined,
          section1: undefined,
          section2: undefined,
          section3: undefined
        }}
        isCustom={false}
      />
    );
  });
});
