import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TechnicalPage from './TechnicalPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<TechnicalPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TechnicalPage />
      </StoreProvider>
    );
  });
});
