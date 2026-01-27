import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import OutputFrequencyResolutionField from './outputFrequencyResolution';
// import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

// const { observatoryConstants } = useOSDAccessors();

describe('<OutputFrequencyResolutionField />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly with out of range value', () => {
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={100000} />
      </StoreProvider>
    );
  });
});
