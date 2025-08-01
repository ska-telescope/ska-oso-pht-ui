import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import GeneralPage from './GeneralPage';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<GeneralPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <GeneralPage />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
