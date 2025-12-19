import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import FrequencyAveraging from './frequencyAveraging';

describe('<FrequencyAveraging />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <FrequencyAveraging value={0} />
      </StoreProvider>
    );
  });
});
