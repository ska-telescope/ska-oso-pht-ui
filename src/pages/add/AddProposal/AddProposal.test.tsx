import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddProposal from './AddProposal';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<AddProposal />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <AddProposal />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
