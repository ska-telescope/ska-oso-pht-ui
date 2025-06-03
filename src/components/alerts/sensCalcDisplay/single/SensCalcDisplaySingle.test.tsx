import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SensCalcDisplaySingle from './SensCalcDisplaySingle';

describe('<SensCalcDisplaySingle />', () => {
  test('renders correctly', () => {
    render(<SensCalcDisplaySingle sensCalc={undefined} show={false} field={''} isCustom={false} />);
  });
});
