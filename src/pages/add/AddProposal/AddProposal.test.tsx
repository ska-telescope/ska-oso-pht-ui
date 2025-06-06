import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddProposal from './AddProposal';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<AddProposal />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AddProposal />
      </StoreProvider>
    );
  });
});
