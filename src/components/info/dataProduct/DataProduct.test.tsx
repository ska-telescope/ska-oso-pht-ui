import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AppFlowProvider } from '@utils/appFlow/AppFlowContext.tsx';
import DataProduct from './DataProduct';
import { IW_BRIGGS } from '@/utils/constantsSensCalc';
import Observation from '@/utils/types/observation';

// Mock translation function
const t = (key: string) => key;

const mockData = {
  id: '1',
  observationId: 'mock-observation-1',
  dataProductType: 0,
  imageSizeValue: 512,
  imageSizeUnits: 1,
  pixelSizeValue: 0.5,
  pixelSizeUnits: 1,
  weighting: IW_BRIGGS,
  robust: 0.5,
  channelsOut: 4,
  fitSpectralPol: 3,
  taperValue: 1,
  timeAveraging: 0,
  frequencyAveraging: 0,
  bitDepth: 0,
  continuumSubtraction: false,
  polarisations: ['I', 'Q', 'U', 'V']
};

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

describe('<DataProduct />', () => {
  test('renders correctly with provided data', () => {
    wrapper(<DataProduct t={t} data={mockData} observation={mockObservation} />);

    // Check for translated labels
    expect(screen.getByText('imageSize.label')).toBeInTheDocument();
    expect(screen.getByText('pixelSize.label')).toBeInTheDocument();
    expect(screen.getByText('imageWeighting.label')).toBeInTheDocument();
    expect(screen.getByText('channelsOut.label')).toBeInTheDocument();
    expect(screen.getByText('polarisations.label')).toBeInTheDocument();
  });
});
