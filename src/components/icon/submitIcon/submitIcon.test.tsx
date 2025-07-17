import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubmitIcon from './submitIcon';

describe('<StarIcon />', () => {
  const onClick = vi.fn();
  test('renders correctly', () => {
    render(<SubmitIcon onClick={onClick} />);
  });
});
