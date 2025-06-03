import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SrcDataPage from './SrcDataPage';

describe('<SrcDataPage />', () => {
  test('renders correctly', () => {
    render(<SrcDataPage />);
  });
});
