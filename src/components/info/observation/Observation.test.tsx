import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AppFlowProvider } from '@utils/appFlow/AppFlowContext.tsx';
import ObservationInfo from './Observation';
import Observation from '@/utils/types/observation';

// Mock translation function
const t = (key: string) => key;

const mockObservation: Observation = {
  id: 'mock-observation-1',
  type: 0,
  pstMode: 0,
  telescope: 0,
  subarray: 0,
  linked: '',
  observingBand: 0,
  elevation: 0,
  weather: 0,
  centralFrequency: 0,
  centralFrequencyUnits: 0,
  bandwidth: 0,
  continuumBandwidth: 0,
  continuumBandwidthUnits: 0,
  spectralAveraging: 0,
  effectiveResolution: '0',
  tapering: 0,
  imageWeighting: 0,
  robust: 0,
  supplied: { type: 0, value: 0, units: 0 },
  spectralResolution: '0'
};

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<Observation />', () => {
  test('renders correctly with provided data', () => {
    wrapper(<ObservationInfo t={t} observation={mockObservation} />);
  });
});
