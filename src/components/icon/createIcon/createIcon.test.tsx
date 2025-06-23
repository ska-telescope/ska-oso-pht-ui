import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateIcon from './createIcon';

describe('<TickIcon />', () => {
  test('renders correctly', () => {
    render(<CreateIcon onClick={vi.fn()} />);
  });
});
