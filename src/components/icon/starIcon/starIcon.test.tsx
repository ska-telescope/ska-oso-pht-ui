import { describe, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarIcon from './starIcon';

describe('<StarIcon />', () => {
  const onClick = vi.fn();
  test('renders correctly', () => {
    render(<StarIcon onClick={onClick} />);
  });
});
