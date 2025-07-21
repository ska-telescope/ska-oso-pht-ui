import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TechnicalPage from './TechnicalPage';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<TechnicalPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <TechnicalPage />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
