import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TeamPage from './TeamPage';

describe('<TeamPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TeamPage />
      </StoreProvider>
    );
  });
});

// TODO - Add more tests for TeamPage component
