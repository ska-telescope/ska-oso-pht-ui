import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TargetMosaicSection from './targetMosaicSection';

describe('<TargetMosaicSection />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TargetMosaicSection />
      </StoreProvider>
    );
  });
});
