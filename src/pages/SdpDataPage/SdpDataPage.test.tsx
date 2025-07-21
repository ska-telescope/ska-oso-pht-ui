import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SdpDataPage from './SdpDataPage';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<SdpDataPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <SdpDataPage />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
