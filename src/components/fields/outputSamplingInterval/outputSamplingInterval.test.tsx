import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import OutputSamplingIntervalField from './outputSamplingInterval';

describe('<OutputSamplingIntervalField />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={0} />
      </StoreProvider>
    );
  });
});
