import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageWeighting from './imageWeighting';

describe('<ImageWeighting />', () => {
  test('renders correctly', () => {
    render(<ImageWeighting value={0} />);
  });
});
