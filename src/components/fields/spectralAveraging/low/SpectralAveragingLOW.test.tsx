import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralAveragingLOW from './SpectralAveragingLOW';

describe('<SpectralAveragingLOW />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SpectralAveragingLOW value={0} subarray={0} type={0} />
      </StoreProvider>
    );
  });
});
