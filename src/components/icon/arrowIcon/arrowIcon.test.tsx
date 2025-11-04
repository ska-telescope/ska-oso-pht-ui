import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArrowIcon from './arrowIcon';

describe('<ArrowIcon />', () => {
  test('renders correctly', () => {
    render(<ArrowIcon onClick={vi.fn()} />);
  });
});
