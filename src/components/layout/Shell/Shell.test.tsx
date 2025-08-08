import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import Shell from './Shell';

describe('<Shell />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <Shell page={0} />
      </StoreProvider>
    );
  });
});
