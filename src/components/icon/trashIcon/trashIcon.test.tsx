import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrashIcon from './trashIcon';

describe('<TrashIcon />', () => {
  test('renders correctly', () => {
    render(<TrashIcon onClick={vi.fn()} />);
  });
});
