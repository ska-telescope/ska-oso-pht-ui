import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpPanel from './HelpPanel';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<HelpPanel />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <HelpPanel />
      </StoreProvider>
    );
  });
});
