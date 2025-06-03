import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SdpDataPage from './SdpDataPage';

describe('<SdpDataPage />', () => {
  test('renders correctly', () => {
    render(<SdpDataPage />);
  });
});
