import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AppFlowProvider } from '@utils/appFlow/AppFlowContext.tsx';
import DataProduct from './DataProduct';
import { IW_BRIGGS } from '@/utils/constantsSensCalc';

// Mock translation function
const t = (key: string) => key;

const mockData = {
  id: 1,
  observationId: ['mock-observation-1'],
  observatoryDataProduct: [true, false, true], // should render options 1 and 3
  imageSizeValue: 512,
  imageSizeUnits: 1,
  pixelSizeValue: 0.5,
  pixelSizeUnits: 1,
  weighting: IW_BRIGGS.toString(),
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

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<DataProduct />', () => {
  test('renders correctly with provided data', () => {
    wrapper(<DataProduct t={t} data={mockData} />);

    // Check for translated labels
    expect(screen.getByText('dataProductType.label')).toBeInTheDocument();
    expect(screen.getByText('imageSize.label')).toBeInTheDocument();
    expect(screen.getByText('pixelSize.label')).toBeInTheDocument();
    expect(screen.getByText('imageWeighting.label')).toBeInTheDocument();
    expect(screen.getByText('channelsOut.label')).toBeInTheDocument();
    expect(screen.getByText('polarisations.label')).toBeInTheDocument();
  });
});
