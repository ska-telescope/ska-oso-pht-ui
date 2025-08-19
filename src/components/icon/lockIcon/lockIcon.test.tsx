import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import LockIcon from './lockIcon';

describe('<LockIcon />', () => {
  test('renders correctly', () => {
    render(<LockIcon onClick={vi.fn()} />);
  });
});
