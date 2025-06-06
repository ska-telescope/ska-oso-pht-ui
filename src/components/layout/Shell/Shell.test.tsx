import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Shell from './Shell';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<Shell />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <Shell page={0} />
      </StoreProvider>
    );
  });
});
