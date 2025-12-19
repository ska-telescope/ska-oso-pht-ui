import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpandIcon from './expandIcon';

describe('<ExpandIcon />', () => {
  test('renders correctly', () => {
    render(<ExpandIcon onClick={vi.fn()} />);
  });
});
