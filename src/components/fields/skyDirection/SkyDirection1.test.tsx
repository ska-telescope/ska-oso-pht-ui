import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import SkyDirection1 from './SkyDirection1';

describe('<SkyDirection1 />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SkyDirection1 skyUnits={0} value={''} />
      </StoreProvider>
    );
  });
});
