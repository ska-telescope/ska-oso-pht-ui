import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlusIcon from './plusIcon';

describe('<PlusIcon />', () => {
  test('renders correctly', () => {
    render(<PlusIcon onClick={vi.fn()} />);
  });
});
