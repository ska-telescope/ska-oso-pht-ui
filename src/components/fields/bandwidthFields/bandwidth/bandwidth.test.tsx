import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import Bandwidth from './bandwidth';

const value = 1;

describe('<Bandwidth />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <Bandwidth
          telescope={1}
          testId="bandwidth"
          value={value}
          observingBand={0}
          centralFrequency={200}
          centralFrequencyUnits={1}
          setScaledBandwidth={vi.fn()}
          subarrayConfig={8}
        />
      </StoreProvider>
    );
  });
  test('renders correctly ( suffix )', () => {
    render(
      <StoreProvider>
        <Bandwidth
          observingBand={0}
          telescope={2}
          testId="bandwidth"
          value={value}
          centralFrequencyUnits={1}
          setScaledBandwidth={vi.fn()}
          suffix={'#'}
        />
      </StoreProvider>
    );
  });
});
