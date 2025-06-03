import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamPage from './TeamPage';

describe('<TeamPage />', () => {
  test('renders correctly', () => {
    render(<TeamPage />);
  });
});
