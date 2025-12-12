import { describe, it, expect } from 'vitest';
import { IW_UNIFORM } from '@utils/constants.ts';
import {
  DEFAULT_SPECTRAL_DATA_PRODUCT,
  DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT,
  DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT,
  DEFAULT_PST_IMAGES_DATA_PRODUCT,
  DEFAULT_PST_VISIBILITIES_DATA_PRODUCT
} from './dataProduct';

describe('DEFAULT_SPECTRAL_DATA_PRODUCT', () => {
  it('should have the correct default values', () => {
    expect(DEFAULT_SPECTRAL_DATA_PRODUCT).toEqual({
      id: 'SDP-0000000',
      observationId: 'obs-123',
      imageSizeValue: 2.5,
      imageSizeUnits: 0,
      pixelSizeValue: 1.6,
      pixelSizeUnits: 2,
      weighting: IW_UNIFORM,
      polarisations: ['I', 'XX'],
      channelsOut: 40,
      taperValue: 0,
      continuumSubtraction: false
    });
  });

  it('should have polarisations as an array containing "I" and "XX"', () => {
    expect(DEFAULT_SPECTRAL_DATA_PRODUCT.polarisations).toContain('I');
    expect(DEFAULT_SPECTRAL_DATA_PRODUCT.polarisations).toContain('XX');
  });

  it('should have continuumSubtraction set to false', () => {
    expect(DEFAULT_SPECTRAL_DATA_PRODUCT.continuumSubtraction).toBe(false);
  });
});

describe('DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT', () => {
  it('should have the correct default values', () => {
    expect(DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT).toEqual({
      id: 'SDP-0000000',
      dataProductType: 1,
      observationId: 'obs-123',
      imageSizeValue: 2.5,
      imageSizeUnits: 0,
      pixelSizeValue: 1.6,
      pixelSizeUnits: 2,
      weighting: IW_UNIFORM,
      polarisations: ['I', 'XX'],
      taperValue: 0,
      channelsOut: 40
    });
  });

  it('should have polarisations as an array containing "I" and "XX"', () => {
    expect(DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT.polarisations).toContain('I');
    expect(DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT.polarisations).toContain('XX');
  });

  it('should have dataProductType set to 1', () => {
    expect(DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT.dataProductType).toBe(1);
  });

  it('should have channelsOut set to 40', () => {
    expect(DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT.channelsOut).toBe(40);
  });
});

describe('DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT', () => {
  it('should have the correct default values', () => {
    expect(DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT).toEqual({
      id: 'SDP-0000000',
      dataProductType: 2,
      observationId: 'obs-123',
      timeAveraging: 3.4,
      frequencyAveraging: 21.7
    });
  });

  it('should have dataProductType set to 2', () => {
    expect(DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT.dataProductType).toBe(2);
  });

  it('should have timeAveraging set to 3.4', () => {
    expect(DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT.timeAveraging).toBe(3.4);
  });

  it('should have frequencyAveraging set to 21.7', () => {
    expect(DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT.frequencyAveraging).toBe(21.7);
  });
});

describe('DEFAULT_PST_IMAGES_DATA_PRODUCT', () => {
  it('should have the correct default values', () => {
    expect(DEFAULT_PST_IMAGES_DATA_PRODUCT).toEqual({
      id: 'SDP-0000000',
      dataProductType: 1,
      observationId: 'obs-123',
      imageSizeValue: 2.5,
      imageSizeUnits: 0,
      pixelSizeValue: 1.6,
      pixelSizeUnits: 2,
      weighting: IW_UNIFORM,
      polarisations: ['XX'],
      channelsOut: 40,
      taperValue: 0,
      bitDepth: 1
    });
  });

  it('should have polarisations as an array containing "XX"', () => {
    expect(DEFAULT_PST_IMAGES_DATA_PRODUCT.polarisations).toContain('XX');
  });

  it('should have bitDepth set to 1', () => {
    expect(DEFAULT_PST_IMAGES_DATA_PRODUCT.bitDepth).toBe(1);
  });

  it('should have dataProductType set to 1', () => {
    expect(DEFAULT_PST_IMAGES_DATA_PRODUCT.dataProductType).toBe(1);
  });

  it('should have channelsOut set to 40', () => {
    expect(DEFAULT_PST_IMAGES_DATA_PRODUCT.channelsOut).toBe(40);
  });
});

describe('DEFAULT_PST_VISIBILITIES_DATA_PRODUCT', () => {
  it('should have the correct default values', () => {
    expect(DEFAULT_PST_VISIBILITIES_DATA_PRODUCT).toEqual({
      id: 'SDP-0000000',
      dataProductType: 2,
      observationId: 'obs-123',
      polarisations: ['XX'],
      timeAveraging: 3.4,
      frequencyAveraging: 21.7,
      bitDepth: 1
    });
  });

  it('should have polarisations as an array containing "XX"', () => {
    expect(DEFAULT_PST_VISIBILITIES_DATA_PRODUCT.polarisations).toContain('XX');
  });

  it('should have bitDepth set to 1', () => {
    expect(DEFAULT_PST_VISIBILITIES_DATA_PRODUCT.bitDepth).toBe(1);
  });

  it('should have dataProductType set to 2', () => {
    expect(DEFAULT_PST_VISIBILITIES_DATA_PRODUCT.dataProductType).toBe(2);
  });

  it('should have timeAveraging set to 3.4', () => {
    expect(DEFAULT_PST_VISIBILITIES_DATA_PRODUCT.timeAveraging).toBe(3.4);
  });

  it('should have frequencyAveraging set to 21.7', () => {
    expect(DEFAULT_PST_VISIBILITIES_DATA_PRODUCT.frequencyAveraging).toBe(21.7);
  });
});
