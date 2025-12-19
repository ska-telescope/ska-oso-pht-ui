import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import BitDepth from './bitDepth';

describe('<BitDepth />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <BitDepth value={0} />
      </StoreProvider>
    );
  });
});
