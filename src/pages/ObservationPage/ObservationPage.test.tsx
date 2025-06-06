import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ObservationPage from './ObservationPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<ObservationPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ObservationPage />
      </StoreProvider>
    );
  });
});
