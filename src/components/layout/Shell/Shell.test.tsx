import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Shell from './Shell';

describe('<Shell />', () => {
  test('renders correctly', () => {
    render(<Shell page={0} />);
  });
});
