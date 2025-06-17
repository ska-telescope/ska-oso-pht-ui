import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CloseIcon from './closeIcon';

describe('<CloseIcon />', () => {
  test('renders correctly', () => {
    render(<CloseIcon onClick={vi.fn()} />);
  });
});
