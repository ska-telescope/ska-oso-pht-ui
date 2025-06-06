import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpectralAveragingMID from './SpectralAveragingMID';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<SpectralAveragingMID />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SpectralAveragingMID value={0} />
      </StoreProvider>
    );
  });
});
