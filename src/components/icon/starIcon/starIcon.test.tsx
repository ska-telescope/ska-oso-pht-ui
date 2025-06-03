import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarIcon from './starIcon';

describe('<StarIcon />', () => {
  test('renders correctly', () => {
    render(<StarIcon />);
  });
});
