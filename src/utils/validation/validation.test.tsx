import { describe, it, expect } from 'vitest';
import {
  validateContinuumDataProduct,
  validatePSTDataProduct,
  validateSpectralDataProduct
} from '@utils/validation/validation.tsx';

describe('validateSpectralDataProduct', () => {
  it('returns true for valid spectral data product', () => {
    const proposal = {
      dataProductSDP: [
        {
          imageSizeValue: 100,
          imageSizeUnits: 'arcsec',
          pixelSizeValue: 0.5,
          pixelSizeUnits: 'arcsec',
          weighting: 'natural',
          taperValue: 1,
          channelsOut: 32,
          continuumSubtraction: true,
          polarisations: ['XX', 'YY']
        }
      ]
    };
    expect(validateSpectralDataProduct(proposal as any)).toBe(true);
  });

  it('returns false if any required field is missing', () => {
    const proposal = {
      dataProductSDP: [
        {
          imageSizeValue: null,
          imageSizeUnits: 'arcsec',
          pixelSizeValue: 0.5,
          pixelSizeUnits: 'arcsec',
          weighting: 'natural',
          taperValue: 1,
          channelsOut: 32,
          continuumSubtraction: true,
          polarisations: ['XX', 'YY']
        }
      ]
    };
    expect(validateSpectralDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if continuumSubtraction is undefined', () => {
    const proposal = {
      dataProductSDP: [
        {
          imageSizeValue: 100,
          imageSizeUnits: 'arcsec',
          pixelSizeValue: 0.5,
          pixelSizeUnits: 'arcsec',
          weighting: 'natural',
          taperValue: 1,
          channelsOut: 32,
          polarisations: ['XX', 'YY']
        }
      ]
    };
    expect(validateSpectralDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if polarisations is empty', () => {
    const proposal = {
      dataProductSDP: [
        {
          imageSizeValue: 100,
          imageSizeUnits: 'arcsec',
          pixelSizeValue: 0.5,
          pixelSizeUnits: 'arcsec',
          weighting: 'natural',
          taperValue: 1,
          channelsOut: 32,
          continuumSubtraction: true,
          polarisations: []
        }
      ]
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
          dataProductType: 1,
          imageSizeValue: 100,
          imageSizeUnits: 'arcsec',
          pixelSizeValue: 0.5,
          pixelSizeUnits: 'arcsec',
          weighting: 'natural',
          taperValue: 1,
          channelsOut: 32,
          polarisations: ['XX', 'YY']
        }
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(true);
  });

  it('returns false if any required image field is missing', () => {
    const proposal = {
      dataProductSDP: [
        {
          dataProductType: 1,
          imageSizeValue: null,
          imageSizeUnits: 'arcsec',
          pixelSizeValue: 0.5,
          pixelSizeUnits: 'arcsec',
          weighting: 'natural',
          taperValue: 1,
          channelsOut: 32,
          polarisations: ['XX', 'YY']
        }
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if polarisations is empty for image', () => {
    const proposal = {
      dataProductSDP: [
        {
          dataProductType: 1,
          imageSizeValue: 100,
          imageSizeUnits: 'arcsec',
          pixelSizeValue: 0.5,
          pixelSizeUnits: 'arcsec',
          weighting: 'natural',
          taperValue: 1,
          channelsOut: 32,
          polarisations: []
        }
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns true for valid visibilities data product', () => {
    const proposal = {
      dataProductSDP: [
        {
          dataProductType: 2,
          timeAveraging: 10,
          frequencyAveraging: 20
        }
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(true);
  });

  it('returns false if timeAveraging is missing for visibilities', () => {
    const proposal = {
      dataProductSDP: [
        {
          dataProductType: 2,
          timeAveraging: null,
          frequencyAveraging: 20
        }
      ]
    };
    expect(validateContinuumDataProduct(proposal as any)).toBe(false);
  });

  it('returns false if frequencyAveraging is missing for visibilities', () => {
    const proposal = {
      dataProductSDP: [
        {
          dataProductType: 2,
          timeAveraging: 10,
          frequencyAveraging: null
        }
      ]
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
  it('returns true when bitDepth is not null and polarisations has items', () => {
    const proposal = {
      dataProductSDP: [
        {
          bitDepth: 8,
          polarisations: ['X']
        }
      ]
    };
    expect(validatePSTDataProduct(proposal as any)).toBe(true);
  });

  it('returns false when bitDepth is null', () => {
    const proposal = {
      dataProductSDP: [
        {
          bitDepth: null,
          polarisations: ['X']
        }
      ]
    };
    expect(validatePSTDataProduct(proposal as any)).toBe(false);
  });

  it('returns false when polarisations is empty', () => {
    const proposal = {
      dataProductSDP: [
        {
          bitDepth: 8,
          polarisations: []
        }
      ]
    };
    expect(validatePSTDataProduct(proposal as any)).toBe(false);
  });

  it('returns false when dataProductSDP is undefined', () => {
    const proposal = {};
    expect(validatePSTDataProduct(proposal as any)).toBe(false);
  });

  it('returns false when dataProductSDP[0] is undefined', () => {
    const proposal = { dataProductSDP: [] };
    expect(validatePSTDataProduct(proposal as any)).toBe(false);
  });
});
