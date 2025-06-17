import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Robust from './Robust';

describe('<Robust />', () => {
  test('renders correctly', () => {
    render(<Robust label={''} testId={''} value={''} />);
  });
  test('renders correctly, with suffix', () => {
    render(<Robust label={''} suffix={'?'} testId={''} value={''} />);
  });
});
