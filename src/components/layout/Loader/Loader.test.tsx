import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loader from './Loader';

describe('<Loader />', () => {
  test('renders correctly', () => {
    render(<Loader />);
  });
});
