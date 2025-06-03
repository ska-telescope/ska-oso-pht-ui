import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ObservationPage from './ObservationPage';

describe('<ObservationPage />', () => {
  test('renders correctly', () => {
    render(<ObservationPage />);
  });
});
