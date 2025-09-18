import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import Velocity from './Velocity';

describe('<Velocity />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <Velocity setVel={vi.fn()} vel={''} velType={0} velUnit={0} />
      </StoreProvider>
    );
  });
});
