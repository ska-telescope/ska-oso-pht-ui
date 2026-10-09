import type { ContinuumImage } from '@/generated/models/continuum-image';
import type { ContinuumVisibilities } from '@/generated/models/continuum-visibilities';
import type { SpectralImage } from '@/generated/models/spectral-image';
import type { PstDetectedFilterbank } from '@/generated/models/pst-detected-filterbank';
import type { PstTiming } from '@/generated/models/pst-timing';
import type { PstFlowthrough } from '@/generated/models/pst-flowthrough';
import type { DataProductSDP } from '@/generated/models/data-product-sdp';
import type { DataProductSRC as DataProductSRCPDM } from '@/generated/models/data-product-src';

export type DataProductSDPContinuumImageBackend = ContinuumImage;

export type DataProductSDPContinuumVisibilitiesBackend = ContinuumVisibilities;

export type DataProductSDPSpectralImageBackend = SpectralImage;

export type DataProductSDPPSTDetectedFilterBankBackend = PstDetectedFilterbank;

export type DataProductSDPPSTTimingBackend = PstTiming;

export type DataProductSDPPSTFlowthroughBackend = PstFlowthrough;

export type DataProductSDPsBackend = DataProductSDP;

export type DataProductSRCNetBackend = DataProductSRCPDM;

export type DataProductSDPNew = {
  // TODO rename DataProductSDP instead
  id: string;
  observationId: string;
  // the data product used for the sensitivity results
  // (and selected when Data Product page renders)
  selected?: boolean;
  data:
    | SDPImageContinuumData
    | SDPVisibilitiesContinuumData
    | SDPSpectralData
    | SDPFilterbankPSTData
    | SDPTimingPSTData
    | SDPFlowthroughPSTData;
};

// 6 modes
export type SDPImageContinuumData = {
  dataProductType: number;
  imageSizeValue: number;
  imageSizeUnits: number;
  pixelSizeValue: number;
  pixelSizeUnits: number;
  weighting: number;
  robust: number;
  taperValue: number;
  channelsOut: number;
  polarisations: string[];
};

export type SDPVisibilitiesContinuumData = {
  dataProductType: number;
  timeAveraging: number;
  frequencyAveraging: number;
};

export type SDPSpectralData = {
  imageSizeValue: number;
  imageSizeUnits: number;
  pixelSizeValue: number;
  pixelSizeUnits: number;
  weighting: number;
  robust: number;
  taperValue: number;
  channelsOut: number;
  polarisations: string[];
  continuumSubtraction: boolean;
};

export type SDPFlowthroughPSTData = {
  dataProductType: number;
  polarisations: string[];
  bitDepth: number;
};

export type SDPTimingPSTData = {
  dataProductType: number;
};

export type SDPFilterbankPSTData = {
  dataProductType: number;
  bitDepth: number;
  polarisations: string[];
  outputFrequencyResolution: number;
  outputSamplingInterval: number;
  dispersionMeasure: number;
  rotationMeasure: number;
};

export type DataProductSRC = {
  id: string; // base
  dataProductType: number; // base
  observationId: string; // base
};
