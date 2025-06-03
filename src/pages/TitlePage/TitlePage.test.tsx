import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TitlePage from './TitlePage';

describe('<TitlePage />', () => {
  test('renders correctly', () => {
    render(<TitlePage />);
  });
});
