import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import SpatialImaging from './SpatialImaging';

describe('<SpatialImaging />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SpatialImaging />
      </StoreProvider>
    );
  });
});
