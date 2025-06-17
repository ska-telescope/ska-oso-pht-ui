import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewIcon from './viewIcon';

describe('<ViewIcon />', () => {
  test('renders correctly', () => {
    render(<ViewIcon onClick={vi.fn()} />);
  });
});
