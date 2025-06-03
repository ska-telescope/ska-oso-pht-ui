import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditIcon from './editIcon';

describe('<EditIcon />', () => {
  test('renders correctly', () => {
    render(<EditIcon onClick={vi.fn()} />);
  });
});
