import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bandwidth from './bandwidth';

const value = 1;

describe('<Bandwidth />', () => {
  test('renders correctly', () => {
    render(
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
    );
  });
  test('renders correctly ( suffix )', () => {
    render(
      <Bandwidth
        telescope={2}
        testId="bandwidth"
        value={value}
        centralFrequencyUnits={1}
        setScaledBandwidth={vi.fn()}
        suffix={'#'}
      />
    );
  });
});
