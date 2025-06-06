import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpectralAveraging from './SpectralAveraging';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<SpectralAveraging />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SpectralAveraging widthLabel={0} value={0} />
      </StoreProvider>
    );
  });
});
