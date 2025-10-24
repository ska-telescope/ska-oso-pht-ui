import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ContinuumBandwidth from './continuumBandwidth';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const value = 20;

describe('<ContinuumBandwidth />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AppFlowProvider>
          <ContinuumBandwidth
            telescope={1}
            value={value}
            centralFrequency={1}
            centralFrequencyUnits={1}
            observingBand={1}
            continuumBandwidthUnits={2}
            setScaledBandwidth={vi.fn()}
            subarrayConfig={8}
          />
        </AppFlowProvider>
      </StoreProvider>
    );
  });
});
