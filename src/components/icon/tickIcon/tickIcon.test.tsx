import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TickIcon from './tickIcon';

describe('<TickIcon />', () => {
  test('renders correctly', () => {
    render(<TickIcon onClick={vi.fn()} />);
  });
});
