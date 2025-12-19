import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import Taper from './taper';

describe('<Taper />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <Taper value={0} />
      </StoreProvider>
    );
  });
});
