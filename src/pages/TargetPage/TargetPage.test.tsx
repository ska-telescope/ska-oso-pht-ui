import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetPage from './TargetPage';

describe('<TargetPage />>', () => {
  test('renders correctly', () => {
    render(<TargetPage />);
  });
});
