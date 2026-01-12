import { describe, it, expect } from 'vitest';
import {
  validateContinuumDataProduct,
  validatePSTDataProduct,
  validateSpectralDataProduct
} from '@utils/validation/validation.tsx';
import {
  DataProductSDPNew,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPVisibilitiesContinuumData
} from '../types/dataProduct';
import { IW_UNIFORM, ROBUST_DEFAULT, TAPER_DEFAULT } from '../constants';

describe('validateSpectralDataProduct', () => {
  it('returns true for valid spectral data product', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            imageSizeValue: 2.5,
            imageSizeUnits: 0,
            pixelSizeValue: 1.6,
            pixelSizeUnits: 2,
            weighting: IW_UNIFORM,
            polarisations: ['I', 'XX'],
            channelsOut: 40,
            robust: ROBUST_DEFAULT,
            taperValue: TAPER_DEFAULT,
            continuumSubtraction: true
          } as SDPSpectralData
        }
      ] as DataProductSDPNew[]
    };
    expect(validateSpectralDataProduct(proposal as any)).toBe(true);
  });

  it('returns false if any required field is missing', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            imageSizeValue: 2.5,
            imageSizeUnits: 0,
            pixelSizeValue: 1.6,
            pixelSizeUnits: 2,
            polarisations: ['I', 'XX'],
            channelsOut: 40,
            robust: ROBUST_DEFAULT,
            taperValue: TAPER_DEFAULT,
            continuumSubtraction: true
          } as SDPSpectralData
        }
      ] as DataProductSDPNew[]
    };
    expect(validateSpectralDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if continuumSubtraction is undefined', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            imageSizeValue: 2.5,
            imageSizeUnits: 0,
            pixelSizeValue: 1.6,
            pixelSizeUnits: 2,
            polarisations: ['I', 'XX'],
            channelsOut: 40,
            robust: ROBUST_DEFAULT,
            taperValue: TAPER_DEFAULT,
            continuumSubtraction: undefined
          } as Partial<SDPSpectralData>
        }
      ] as DataProductSDPNew[]
    };
    expect(validateSpectralDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if polarisations is empty', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            imageSizeValue: 2.5,
            imageSizeUnits: 0,
            pixelSizeValue: 1.6,
            pixelSizeUnits: 2,
            weighting: IW_UNIFORM,
            polarisations: [],
            channelsOut: 40,
            robust: ROBUST_DEFAULT,
            taperValue: TAPER_DEFAULT,
            continuumSubtraction: true
          } as SDPSpectralData
        }
      ] as DataProductSDPNew[]
    };
    expect(validateSpectralDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if dataProductSDP is undefined', () => {
    const proposal = {};
    expect(validateSpectralDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if dataProductSDP[0] is undefined', () => {
    const proposal = { dataProductSDP: [] };
    expect(validateSpectralDataProduct(proposal as any)).toBe(false);
  });
});

describe('validateContinuumDataProduct', () => {
  it('returns true for valid image data product', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: 1,
            imageSizeValue: 100,
            imageSizeUnits: 1,
            pixelSizeValue: 0.5,
            pixelSizeUnits: 1,
            weighting: IW_UNIFORM,
            taperValue: 1,
            channelsOut: 32,
            polarisations: ['XX', 'YY'],
            robust: 1
          } as SDPImageContinuumData
        } as DataProductSDPNew
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(true);
  });

  it('returns false if any required image field is missing', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: 1,
            imageSizeValue: 100,
            imageSizeUnits: 1,
            pixelSizeValue: 0.5,
            pixelSizeUnits: 1,
            weighting: IW_UNIFORM,
            taperValue: 1,
            polarisations: ['XX', 'YY']
          } as Partial<SDPImageContinuumData>
        } as DataProductSDPNew
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if polarisations is empty for image', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: 1,
            imageSizeValue: 100,
            imageSizeUnits: 1,
            pixelSizeValue: 0.5,
            pixelSizeUnits: 1,
            weighting: IW_UNIFORM,
            taperValue: 1,
            channelsOut: 32,
            polarisations: [],
            robust: 1
          } as SDPImageContinuumData
        } as DataProductSDPNew
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns true for valid visibilities data product', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: 2,
            timeAveraging: 10,
            frequencyAveraging: 20
          } as SDPVisibilitiesContinuumData
        }
      ] as DataProductSDPNew[]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(true);
  });

  it('returns false if timeAveraging is missing for visibilities', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',

          data: {
            dataProductType: 2,
            timeAveraging: null as any,
            frequencyAveraging: 20
          } as SDPVisibilitiesContinuumData
        }
      ] as DataProductSDPNew[]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if frequencyAveraging is missing for visibilities', () => {
    const proposal = {
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',

          data: {
            dataProductType: 2,
            timeAveraging: 10,
            frequencyAveraging: null as any
          } as SDPVisibilitiesContinuumData
        }
      ] as DataProductSDPNew[]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if dataProductSDP is undefined', () => {
    const proposal = {};
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if dataProductSDP[0] is undefined', () => {
    const proposal = { dataProductSDP: [] };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });
});

describe('validatePSTDataProduct', () => {
  it('returns false when dataProductSDP is undefined', () => {
    const proposal = {};
    expect(validatePSTDataProduct(proposal as any)).toBe(false);
  });

  it('returns false when dataProductSDP[0] is undefined', () => {
    const proposal = { dataProductSDP: [] };
    expect(validatePSTDataProduct(proposal as any)).toBe(false);
  });
});
