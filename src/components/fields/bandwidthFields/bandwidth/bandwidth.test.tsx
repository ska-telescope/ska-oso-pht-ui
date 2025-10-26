import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import Bandwidth from './bandwidth';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const value = 1;

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<Bandwidth />', () => {
  test('renders correctly', () => {
    wrapper(
      <Bandwidth
        telescope={1}
        testId="bandwidth"
        value={value}
        observingBand={0}
        centralFrequency={200}
        centralFrequencyUnits={1}
        subarrayConfig={8}
      />
    );
  });
  test('renders correctly ( suffix )', () => {
    wrapper(
      <Bandwidth
        observingBand={0}
        telescope={2}
        testId="bandwidth"
        value={value}
        centralFrequencyUnits={1}
        suffix={'#'}
      />
    );
  });
});
