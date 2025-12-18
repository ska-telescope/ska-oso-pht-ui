// DataProduct.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataProduct from './DataProduct';
import { TYPE_CONTINUUM, TYPE_ZOOM, IW_BRIGGS } from '@/utils/constants';
import {
  TYPE_PST,
  DETECTED_FILTER_BANK_VALUE,
  PULSAR_TIMING_VALUE,
  BAND_LOW_STR
} from '@/utils/constants';
import { DataProductSDP } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';

// --- Mock all field components with simple test ids ---
vi.mock('@/components/fields/imageSize/imageSize', () => ({
  default: () => <div data-testid="ImageSizeField" />
}));
vi.mock('@/components/fields/pixelSize/pixelSize', () => ({
  default: () => <div data-testid="PixelSizeField" />
}));
vi.mock('@/components/fields/imageWeighting/imageWeighting', () => ({
  default: () => <div data-testid="ImageWeightingField" />
}));
vi.mock('@/components/fields/robust/Robust', () => ({
  default: () => <div data-testid="RobustField" />
}));
vi.mock('@/components/fields/dataProductType/dataProductType', () => ({
  default: () => <div data-testid="DataProductTypeField" />
}));
vi.mock('@/components/fields/taper/taper', () => ({
  default: () => <div data-testid="TaperField" />
}));
vi.mock('@/components/fields/polarisations/polarisations', () => ({
  default: () => <div data-testid="PolarisationsField" />
}));
vi.mock('@/components/fields/channelsOut/channelsOut', () => ({
  default: () => <div data-testid="ChannelsOutField" />
}));
vi.mock('@/components/fields/timeAveraging/timeAveraging', () => ({
  default: () => <div data-testid="TimeAveragingField" />
}));
vi.mock('@/components/fields/frequencyAveraging/frequencyAveraging', () => ({
  default: () => <div data-testid="FrequencyAveragingField" />
}));
vi.mock('@/components/fields/continuumSubtraction/continuumSubtraction', () => ({
  default: () => <div data-testid="ContinuumSubtractionField" />
}));
vi.mock('@/components/fields/bitDepth/bitDepth', () => ({
  default: () => <div data-testid="BitDepthField" />
}));

// --- Helper data ---
const baseData: DataProductSDP = {
  dataProductType: 1,
  imageSizeValue: 256,
  pixelSizeValue: 0.5,
  weighting: 2,
  robust: 0,
  taperValue: 1,
  channelsOut: 4,
  polarisations: ['XX'],
  continuumSubtraction: true,
  bitDepth: 8,
  timeAveraging: 10,
  frequencyAveraging: 20,
  id: '',
  observationId: '',
  imageSizeUnits: 0,
  pixelSizeUnits: 0,
  fitSpectralPol: 0
};

const baseObservation: Observation = {
  type: TYPE_CONTINUUM,
  pstMode: 1,
  id: '',
  telescope: 0,
  subarray: 0,
  linked: '',
  observingBand: BAND_LOW_STR,
  elevation: 0,
  centralFrequency: 0,
  centralFrequencyUnits: 0,
  bandwidth: null,
  continuumBandwidth: null,
  continuumBandwidthUnits: null,
  supplied: {
    type: 0,
    value: 0,
    units: 0
  },
  spectralResolution: '',
  effectiveResolution: ''
};

const t = (key: string) => key; // simple translation mock

describe('DataProduct', () => {
  it('renders continuum fields when dataProductType=1', () => {
    render(
      <DataProduct t={t} data={{ ...baseData, dataProductType: 1 }} observation={baseObservation} />
    );
    expect(screen.getByTestId('DataProductTypeField')).toBeInTheDocument();
    expect(screen.getByTestId('ImageSizeField')).toBeInTheDocument();
    expect(screen.getByTestId('PixelSizeField')).toBeInTheDocument();
    expect(screen.getByTestId('ImageWeightingField')).toBeInTheDocument();
    expect(screen.getByTestId('TaperField')).toBeInTheDocument();
    expect(screen.getByTestId('ChannelsOutField')).toBeInTheDocument();
    expect(screen.getByTestId('PolarisationsField')).toBeInTheDocument();
  });

  it('renders continuum fields when dataProductType!=1', () => {
    render(
      <DataProduct t={t} data={{ ...baseData, dataProductType: 2 }} observation={baseObservation} />
    );
    expect(screen.getByTestId('TimeAveragingField')).toBeInTheDocument();
    expect(screen.getByTestId('FrequencyAveragingField')).toBeInTheDocument();
  });

  it('renders spectral fields', () => {
    render(
      <DataProduct
        t={t}
        data={{ ...baseData, weighting: IW_BRIGGS }}
        observation={{ ...baseObservation, type: TYPE_ZOOM }}
      />
    );
    expect(screen.getByTestId('ImageSizeField')).toBeInTheDocument();
    expect(screen.getByTestId('PixelSizeField')).toBeInTheDocument();
    expect(screen.getByTestId('ImageWeightingField')).toBeInTheDocument();
    expect(screen.getByTestId('RobustField')).toBeInTheDocument(); // only when IW_BRIGGS
    expect(screen.getByTestId('ContinuumSubtractionField')).toBeInTheDocument();
  });

  it('renders PST fields with detected filterbank', () => {
    render(
      <DataProduct
        t={t}
        data={baseData}
        observation={{
          ...baseObservation,
          type: TYPE_PST,
          pstMode: DETECTED_FILTER_BANK_VALUE
        }}
      />
    );
    expect(screen.getByTestId('TimeAveragingField')).toBeInTheDocument();
    expect(screen.getByTestId('FrequencyAveragingField')).toBeInTheDocument();
    expect(screen.getByTestId('PolarisationsField')).toBeInTheDocument();
  });

  it('renders PST fields without detected filterbank', () => {
    render(
      <DataProduct
        t={t}
        data={baseData}
        observation={{
          ...baseObservation,
          type: TYPE_PST,
          pstMode: PULSAR_TIMING_VALUE
        }}
      />
    );
    expect(screen.getByTestId('BitDepthField')).toBeInTheDocument();
    expect(screen.getByTestId('PolarisationsField')).toBeInTheDocument();
  });
});
