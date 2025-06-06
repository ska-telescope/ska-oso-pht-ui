import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from './LandingPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<LandingPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <LandingPage />
      </StoreProvider>
    );
  });
});
