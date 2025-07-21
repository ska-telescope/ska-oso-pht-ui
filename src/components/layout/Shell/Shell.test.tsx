import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import Shell from './Shell';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<Shell />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <Shell page={0} />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
