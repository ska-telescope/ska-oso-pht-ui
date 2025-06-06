import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusArray from './StatusArray';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<StatusArray />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <StatusArray />
      </StoreProvider>
    );
  });
});
