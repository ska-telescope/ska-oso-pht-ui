import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Elevation from './Elevation';

describe('<Elevation />', () => {
  test('renders correctly', () => {
    render(<Elevation testId={''} value={20} />);
  });
  test('renders correctly, isLow', () => {
    render(<Elevation isLow testId={''} value={0} />);
  });
  test('renders correctly, value > max', () => {
    render(<Elevation isLow testId={''} value={100} />);
  });
});
