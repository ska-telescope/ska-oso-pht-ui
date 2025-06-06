import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamFileImport from './TeamFileImport';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<TeamFileImport />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TeamFileImport />
      </StoreProvider>
    );
  });
});
