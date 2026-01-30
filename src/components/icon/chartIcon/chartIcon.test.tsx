import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartIcon from './chartIcon';

describe('<ChartIcon />', () => {
  test('renders correctly', () => {
    render(<ChartIcon onClick={vi.fn()} />);
  });
});
