import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CloneIcon from './cloneIcon';

describe('<CloneIcon />', () => {
  test('renders correctly', () => {
    render(<CloneIcon onClick={vi.fn()} />);
  });
});
