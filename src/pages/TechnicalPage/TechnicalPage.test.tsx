import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TechnicalPage from './TechnicalPage';

describe('<TechnicalPage />', () => {
  test('renders correctly', () => {
    render(<TechnicalPage />);
  });
});
