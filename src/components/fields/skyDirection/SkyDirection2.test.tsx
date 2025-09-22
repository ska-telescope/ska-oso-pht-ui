import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import SkyDirection2 from './SkyDirection2';

describe('<SkyDirection2 />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SkyDirection2 skyUnits={0} value={''} />
      </StoreProvider>
    );
  });
});
