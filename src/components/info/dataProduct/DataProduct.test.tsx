// DataProduct.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataProduct from './DataProduct';
import {
  TYPE_CONTINUUM,
  TYPE_ZOOM,
  IW_BRIGGS,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE
} from '@/utils/constants';
import {
  TYPE_PST,
  DETECTED_FILTER_BANK_VALUE,
  PULSAR_TIMING_VALUE,
  BAND_LOW_STR
} from '@/utils/constants';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';
import { StoreProvider } from '@utils/storage/store';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

// --- Mock all field components with simple test ids ---
vi.mock('@/components/fields/imageSize/imageSize', () => ({
  default: () => <div>ImageSizeField</div>
}));
vi.mock('@/components/fields/pixelSize/pixelSize', () => ({
  default: () => <div>PixelSizeField</div>
}));
vi.mock('@/components/fields/imageWeighting/imageWeighting', () => ({
  default: () => <div>ImageWeightingField</div>
}));
vi.mock('@/components/fields/robust/Robust', () => ({
  default: () => <div>RobustField</div>
}));
vi.mock('@/components/fields/dataProductType/dataProductType', () => ({
  default: () => <div>DataProductTypeField</div>
}));
vi.mock('@/components/fields/taper/taper', () => ({
  default: () => <div>TaperField</div>
}));
vi.mock('@/components/fields/polarisations/polarisations', () => ({
  default: () => <div>PolarisationsField</div>
}));
vi.mock('@/components/fields/channelsOut/channelsOut', () => ({
  default: () => <div>ChannelsOutField</div>
}));
vi.mock('@/components/fields/timeAveraging/timeAveraging', () => ({
  default: () => <div>TimeAveragingField</div>
}));
vi.mock('@/components/fields/frequencyAveraging/frequencyAveraging', () => ({
  default: () => <div>FrequencyAveragingField</div>
}));
vi.mock('@/components/fields/continuumSubtraction/continuumSubtraction', () => ({
  default: () => <div>ContinuumSubtractionField</div>
}));
vi.mock('@/components/fields/outputFrequencyResolution/outputFrequencyResolution', () => ({
  default: () => <div>outputFrequencyResolution</div>
}));
vi.mock('@/components/fields/outputSamplingInterval/outputSamplingInterval', () => ({
  default: () => <div>outputSamplingInterval</div>
}));
vi.mock('@/components/fields/dispersionMeasure/dispersionMeasure', () => ({
  default: () => <div>dispersionMeasure</div>
}));
vi.mock('@/components/fields/rotationMeasure/rotationMeasure', () => ({
  default: () => <div>rotationMeasure</div>
}));
vi.mock('@/components/fields/bitDepth/bitDepth', () => ({
  default: ({ value, options }: any) => (
    <div
      data-value={value ?? ''}
      data-options={JSON.stringify(options?.map((opt: any) => opt.value) ?? [])}
    >
      BitDepthField
    </div>
  )
}));

// --- Helper data ---
const baseData: DataProductSDPNew = {
  id: '',
  observationId: '',
  data: {
    dataProductType: DP_TYPE_IMAGES,
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
    imageSizeUnits: 0,
    pixelSizeUnits: 0
  }
};

const baseObservation: Observation = {
  type: TYPE_CONTINUUM,
  pstMode: 1,
  id: '',
  telescope: 0,
  subarray: '',
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

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('DataProduct', () => {
  it('renders continuum fields when dataProductType=DP_TYPE_IMAGES', () => {
    wrapper(
      <DataProduct
        t={t}
        sdp={{ ...baseData, data: { ...baseData.data, dataProductType: DP_TYPE_IMAGES } }}
        observation={baseObservation}
      />
    );
    expect(screen.getByText('DataProductTypeField')).toBeInTheDocument();
    expect(screen.getByText('ImageSizeField')).toBeInTheDocument();
    expect(screen.getByText('PixelSizeField')).toBeInTheDocument();
    expect(screen.getByText('ImageWeightingField')).toBeInTheDocument();
    expect(screen.getByText('TaperField')).toBeInTheDocument();
    expect(screen.getByText('ChannelsOutField')).toBeInTheDocument();
    expect(screen.getByText('PolarisationsField')).toBeInTheDocument();
  });

  it('renders visibility fields when dataProductType!=DP_TYPE_IMAGES', () => {
    wrapper(
      <DataProduct
        t={t}
        sdp={{ ...baseData, data: { ...baseData.data, dataProductType: DP_TYPE_VISIBLE } }}
        observation={baseObservation}
      />
    );
    expect(screen.getByText('TimeAveragingField')).toBeInTheDocument();
    expect(screen.getByText('FrequencyAveragingField')).toBeInTheDocument();
  });

  it('renders spectral fields', () => {
    wrapper(
      <DataProduct
        t={t}
        sdp={{ ...baseData, data: { ...baseData.data, weighting: IW_BRIGGS } }}
        observation={{ ...baseObservation, type: TYPE_ZOOM }}
      />
    );
    expect(screen.getByText('ImageSizeField')).toBeInTheDocument();
    expect(screen.getByText('PixelSizeField')).toBeInTheDocument();
    expect(screen.getByText('ImageWeightingField')).toBeInTheDocument();
    expect(screen.getByText('RobustField')).toBeInTheDocument(); // only when IW_BRIGGS
    expect(screen.getByText('ContinuumSubtractionField')).toBeInTheDocument();
  });

  it('renders PST fields : DETECTED_FILTER_BANK_VALUE', () => {
    wrapper(
      <DataProduct
        t={t}
        sdp={baseData}
        observation={{
          ...baseObservation,
          type: TYPE_PST,
          pstMode: DETECTED_FILTER_BANK_VALUE
        }}
      />
    );
    expect(screen.getByText('outputFrequencyResolution')).toBeInTheDocument();
    expect(screen.getByText('outputSamplingInterval')).toBeInTheDocument();
    expect(screen.getByText('dispersionMeasure')).toBeInTheDocument();
    expect(screen.getByText('rotationMeasure')).toBeInTheDocument();
  });

  it('renders PST fields : PULSAR_TIMING_VALUE', () => {
    wrapper(
      <DataProduct
        t={t}
        sdp={baseData}
        observation={{
          ...baseObservation,
          type: TYPE_PST,
          pstMode: PULSAR_TIMING_VALUE
        }}
      />
    );
    expect(screen.getByText('page.7.group.pst.2')).toBeInTheDocument();
  });

  it('uses the PST-specific bit depth option lists in info display', () => {
    const { rerender } = wrapper(
      <DataProduct
        t={t}
        sdp={{ ...baseData, data: { ...baseData.data, bitDepth: 16 } }}
        observation={{
          ...baseObservation,
          type: TYPE_PST,
          pstMode: 0
        }}
      />
    );
    expect(screen.getByText('BitDepthField')).toHaveAttribute('data-options', '[1,2,4,8,16]');

    rerender(
      <DataProduct
        t={t}
        sdp={{ ...baseData, data: { ...baseData.data, bitDepth: 8 } }}
        observation={{
          ...baseObservation,
          type: TYPE_PST,
          pstMode: DETECTED_FILTER_BANK_VALUE
        }}
      />
    );
    expect(screen.getByText('BitDepthField')).toHaveAttribute('data-options', '[1,2,4,8]');
  });
});
