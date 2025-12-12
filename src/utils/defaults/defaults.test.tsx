import { describe, it, expect } from 'vitest';
import { DEFAULT_SPECTRAL_DATA_PRODUCT } from './dataProduct';

describe('DEFAULT_SPECTRAL_DATA_PRODUCT', () => {
  it('should have the correct default values', () => {
    expect(DEFAULT_SPECTRAL_DATA_PRODUCT).toEqual({
      id: 'SDP-0000000',
      observationId: 'obs-123',
      imageSizeValue: 2.5,
      imageSizeUnits: 0,
      pixelSizeValue: 1.6,
      pixelSizeUnits: 2,
      weighting: expect.anything(),
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
