import { describe, test, expect } from 'vitest';
import { SA_AA2, SA_AA_STAR, SA_AA4, SA_CUSTOM } from '@/utils/constants';
import {
  isFineZoomRestricted,
  getZoomResolutionOptions,
  getZoomResolutionHz,
  channelsToBandwidthHz,
  bandwidthHzToChannels,
  stepChannels,
  snapCentralFrequencyToLegalHz,
  stepCentralFrequencyHz
} from '@/utils/zoomWindow.ts';

describe('isFineZoomRestricted', () => {
  test('restricts AA2', () => {
    expect(isFineZoomRestricted(SA_AA2)).toBe(true);
  });
  test('restricts AA*', () => {
    expect(isFineZoomRestricted(SA_AA_STAR)).toBe(true);
  });
  test('does not restrict AA4', () => {
    expect(isFineZoomRestricted(SA_AA4)).toBe(false);
  });
  test('does not restrict Custom', () => {
    expect(isFineZoomRestricted(SA_CUSTOM)).toBe(false);
  });
});

describe('getZoomResolutionOptions', () => {
  test('returns only the coarse options for AA2', () => {
    const options = getZoomResolutionOptions(SA_AA2);
    expect(options.map(o => o.value)).toEqual([5, 6, 7, 8]);
  });

  test('returns only the coarse options for AA*', () => {
    const options = getZoomResolutionOptions(SA_AA_STAR);
    expect(options.map(o => o.value)).toEqual([5, 6, 7, 8]);
  });

  test('returns all 8 options for AA4', () => {
    const options = getZoomResolutionOptions(SA_AA4);
    expect(options.map(o => o.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('returns all 8 options for Custom', () => {
    const options = getZoomResolutionOptions(SA_CUSTOM);
    expect(options.map(o => o.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('formats labels in Hz to 2 d.p.', () => {
    const options = getZoomResolutionOptions(SA_AA2);
    expect(options.map(o => o.label)).toEqual([
      '226.06 Hz',
      '452.11 Hz',
      '904.22 Hz',
      '1808.45 Hz'
    ]);
  });
});

describe('getZoomResolutionHz', () => {
  test('looks up the coarsest resolution', () => {
    expect(getZoomResolutionHz(8)).toBeCloseTo(1808.449074, 5);
  });
  test('looks up a fine resolution', () => {
    expect(getZoomResolutionHz(1)).toBeCloseTo(14.128508, 5);
  });
  test('returns 0 for an unknown index', () => {
    expect(getZoomResolutionHz(99)).toBe(0);
  });
});

describe('channel count <-> bandwidth conversion', () => {
  test('channelsToBandwidthHz multiplies channels by resolution', () => {
    expect(channelsToBandwidthHz(1000, 1808.449074)).toBeCloseTo(1808449.074, 2);
  });

  test('bandwidthHzToChannels rounds to nearest integer channel count', () => {
    expect(bandwidthHzToChannels(1808449.074, 1808.449074, 5000)).toBe(1000);
  });

  test('bandwidthHzToChannels clamps to maxChannels', () => {
    expect(bandwidthHzToChannels(1808449.074 * 10, 1808.449074, 1000)).toBe(1000);
  });

  test('bandwidthHzToChannels clamps to a minimum of 1', () => {
    expect(bandwidthHzToChannels(0, 1808.449074, 1000)).toBe(1);
  });

  test('stepChannels increments and decrements within bounds', () => {
    expect(stepChannels(500, 1, 1000)).toBe(501);
    expect(stepChannels(500, -1, 1000)).toBe(499);
    expect(stepChannels(1000, 1, 1000)).toBe(1000);
    expect(stepChannels(1, -1, 1000)).toBe(1);
  });
});

describe('central frequency snap/step', () => {
  const channelWidthHz = 1808.449074;
  const minHz = 50_000_000;
  const maxHz = 350_000_000;

  test('snaps a frequency to the nearest channel-centre grid point', () => {
    const snapped = snapCentralFrequencyToLegalHz(200_000_000, channelWidthHz, minHz, maxHz);
    const remainder = (snapped / channelWidthHz - 0.5) % 1;
    expect(Math.abs(remainder)).toBeLessThan(1e-6);
  });

  test('stays within min/max bounds', () => {
    const snapped = snapCentralFrequencyToLegalHz(10_000_000, channelWidthHz, minHz, maxHz);
    expect(snapped).toBeGreaterThanOrEqual(minHz);
    const snappedHigh = snapCentralFrequencyToLegalHz(400_000_000, channelWidthHz, minHz, maxHz);
    expect(snappedHigh).toBeLessThanOrEqual(maxHz);
  });

  test('steps by an integer multiple of channel width from a legal value', () => {
    const base = snapCentralFrequencyToLegalHz(200_000_000, channelWidthHz, minHz, maxHz);
    const stepped = stepCentralFrequencyHz(base, 1, channelWidthHz, minHz, maxHz);
    expect(stepped - base).toBeCloseTo(channelWidthHz, 2);
  });
});
