import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MemoryRouter } from 'react-router-dom';
import PHT from './PHT';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<PHT />', () => {
  test('renders correctly', () => {
    render(
      <MemoryRouter>
        <StoreProvider>
          <MockedLoginProvider>
            <PHT />
          </MockedLoginProvider>
        </StoreProvider>
      </MemoryRouter>
    );
  });
});
