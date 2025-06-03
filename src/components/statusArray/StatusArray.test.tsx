import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusArray from './StatusArray';

describe('<StatusArray />', () => {
  test('renders correctly', () => {
    render(<StatusArray />);
  });
});
