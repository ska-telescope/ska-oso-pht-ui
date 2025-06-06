import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpectralAveragingLOW from './SpectralAveragingLOW';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<SpectralAveragingLOW />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SpectralAveragingLOW value={0} subarray={0} type={0} />
      </StoreProvider>
    );
  });
});
