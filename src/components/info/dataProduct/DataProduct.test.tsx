import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
  weighting: IW_BRIGGS,
  robust: 0.5,
  channelsOut: 4,
  fitSpectralPol: 1,
  polarisations: 'I,Q,U,V'
};

describe('<DataProduct />', () => {
  test('renders correctly with provided data', () => {
    render(<DataProduct t={t} data={mockData} />);

    // Check for translated labels
    expect(screen.getByText('observatoryDataProduct.label')).toBeInTheDocument();
    expect(screen.getByText('imageSize.label')).toBeInTheDocument();
    expect(screen.getByText('pixelSize.label')).toBeInTheDocument();
    expect(screen.getByText('imageWeighting.label')).toBeInTheDocument();
    expect(screen.getByText('channelsOut.label')).toBeInTheDocument();
    expect(screen.getByText('robust.label')).toBeInTheDocument();
    expect(screen.getByText('fitSpectralPol.label')).toBeInTheDocument();
    expect(screen.getByText('stokes.label')).toBeInTheDocument();

    // Check for some content values
    expect(screen.getByText('512 imageSize.1')).toBeInTheDocument();
    expect(screen.getByText('0.5 pixelSize.1')).toBeInTheDocument();
    expect(screen.getByText('imageWeighting.2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(1)).toBeInTheDocument();
    expect(screen.getByText('I,Q,U,V')).toBeInTheDocument();
  });
});
