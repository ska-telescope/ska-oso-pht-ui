import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import OutputFrequencyResolutionField from './outputFrequencyResolution';

describe('<OutputFrequencyResolutionField />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={0} />
      </StoreProvider>
    );
  });
});
