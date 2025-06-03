import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeneralPage from './GeneralPage';

describe('<GeneralPage />', () => {
  test('renders correctly', () => {
    render(<GeneralPage />);
  });
});
