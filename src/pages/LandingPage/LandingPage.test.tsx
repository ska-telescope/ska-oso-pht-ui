import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from './LandingPage';

describe('<LandingPage />', () => {
  test('renders correctly', () => {
    render(<LandingPage />);
  });
});
