import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralAveragingMID from './SpectralAveragingMID';

describe('<SpectralAveragingMID />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SpectralAveragingMID value={1} />
      </StoreProvider>
    );
  });
});
