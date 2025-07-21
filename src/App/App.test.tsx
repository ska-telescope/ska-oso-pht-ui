import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import App from './App';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<App />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <App />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
