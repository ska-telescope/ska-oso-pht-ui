import { describe, test, expect } from 'vitest';
import { SA_AA2, SA_AA_STAR, SA_AA4, SA_CUSTOM } from '@/utils/constants';
import {
  isFineZoomRestricted,
  getZoomResolutionOptions,
  getZoomResolutionHz,
  channelsToBandwidthHz,
  bandwidthHzToChannels,
  stepChannels,
  clampCentralFrequencyToWindowHz,
  coarseChannelRangeToHz,
  snapCentralFrequencyToChannelGridHz,
  stepCentralFrequencyHz,
  isCentralFrequencyOnChannelGrid,
  isCentralFrequencyDivisible
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
    expect(options.map((o) => o.value)).toEqual([5, 6, 7, 8]);
  });

  test('returns only the coarse options for AA*', () => {
    const options = getZoomResolutionOptions(SA_AA_STAR);
    expect(options.map((o) => o.value)).toEqual([5, 6, 7, 8]);
  });

  test('returns all 8 options for AA4', () => {
    const options = getZoomResolutionOptions(SA_AA4);
    expect(options.map((o) => o.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('returns all 8 options for Custom', () => {
    const options = getZoomResolutionOptions(SA_CUSTOM);
    expect(options.map((o) => o.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('formats labels in Hz to 2 d.p.', () => {
    const options = getZoomResolutionOptions(SA_AA2);
    expect(options.map((o) => o.label)).toEqual([
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

describe('central frequency window clamp/step', () => {
  const channelWidthHz = 1808.449074;
  const windowBandwidthHz = 1_808_449.074; // 1000 channels
  const minHz = 50_000_000;
  const maxHz = 350_000_000;

  test('leaves a value unchanged when the whole window already fits', () => {
    const clamped = clampCentralFrequencyToWindowHz(200_000_000, windowBandwidthHz, minHz, maxHz);
    expect(clamped).toBe(200_000_000);
  });

  test('clamps so the window does not spill below the band minimum', () => {
    const clamped = clampCentralFrequencyToWindowHz(10_000_000, windowBandwidthHz, minHz, maxHz);
    expect(clamped).toBeCloseTo(minHz + windowBandwidthHz / 2, 6);
  });

  test('clamps so the window does not spill above the band maximum', () => {
    const clamped = clampCentralFrequencyToWindowHz(400_000_000, windowBandwidthHz, minHz, maxHz);
    expect(clamped).toBeCloseTo(maxHz - windowBandwidthHz / 2, 6);
  });

  test('centres the window if it is wider than the whole band', () => {
    const clamped = clampCentralFrequencyToWindowHz(200_000_000, 400_000_000, minHz, maxHz);
    expect(clamped).toBeCloseTo((minHz + maxHz) / 2, 6);
  });

  test('steps by exactly one channel width from an already grid-aligned position', () => {
    const alignedStart = minHz + (windowBandwidthHz / channelWidthHz / 2) * channelWidthHz;
    const stepped = stepCentralFrequencyHz(
      alignedStart,
      1,
      channelWidthHz,
      windowBandwidthHz,
      minHz,
      maxHz
    );
    expect(stepped - alignedStart).toBeCloseTo(channelWidthHz, 6);
  });

  test('stepping also corrects a starting position that is not grid-aligned', () => {
    const stepped = stepCentralFrequencyHz(
      200_000_000,
      1,
      channelWidthHz,
      windowBandwidthHz,
      minHz,
      maxHz
    );
    const numberOfChannels = windowBandwidthHz / channelWidthHz;
    const startChannel = (stepped - minHz) / channelWidthHz - numberOfChannels / 2;
    expect(startChannel).toBeCloseTo(Math.round(startChannel), 6);
  });

  test('stepping past the edge clamps to the nearest legal value instead of overshooting', () => {
    const nearMax = maxHz - windowBandwidthHz / 2;
    const stepped = stepCentralFrequencyHz(
      nearMax,
      1,
      channelWidthHz,
      windowBandwidthHz,
      minHz,
      maxHz
    );
    expect(stepped).toBeCloseTo(nearMax, 6);
  });
});

describe('snapCentralFrequencyToChannelGridHz', () => {
  const channelWidthHz = 1808.449074;
  const numberOfChannels = 1000;
  const minHz = 50_000_000;

  test('leaves an already grid-aligned value unchanged', () => {
    const aligned = minHz + (numberOfChannels / 2 + 42) * channelWidthHz;
    const snapped = snapCentralFrequencyToChannelGridHz(
      aligned,
      channelWidthHz,
      numberOfChannels,
      minHz
    );
    expect(snapped).toBeCloseTo(aligned, 6);
  });

  test('snaps an arbitrary value to the nearest whole start channel', () => {
    const aligned = minHz + (numberOfChannels / 2 + 42) * channelWidthHz;
    const snapped = snapCentralFrequencyToChannelGridHz(
      aligned + channelWidthHz * 0.3,
      channelWidthHz,
      numberOfChannels,
      minHz
    );
    expect(snapped).toBeCloseTo(aligned, 6);
  });

  test('returns the input unchanged if channel width is not positive', () => {
    expect(snapCentralFrequencyToChannelGridHz(123_456, 0, numberOfChannels, minHz)).toBe(123_456);
  });
});

describe('snapCentralFrequencyToChannelGridHz - worked examples', () => {
  // minHz here plays the role of "the reference frequency the examples are counted from".
  const minHz = 200_000_000;

  const isOnGrid = (freqHz: number, channelWidthHz: number, numberOfChannels: number) =>
    Math.abs(
      snapCentralFrequencyToChannelGridHz(freqHz, channelWidthHz, numberOfChannels, minHz) - freqHz
    ) < 1e-6;

  test('200 MHz with an even number of channels of any width is fine', () => {
    expect(isOnGrid(200_000_000, 1808.449074, 1000)).toBe(true);
    expect(isOnGrid(200_000_000, 226.056, 500)).toBe(true);
  });

  test('200 MHz with an odd number of channels of any width is not fine', () => {
    expect(isOnGrid(200_000_000, 1808.449074, 1001)).toBe(false);
    expect(isOnGrid(200_000_000, 226.056, 501)).toBe(false);
  });

  test('200.000226 MHz with an even number of channels of width 226 Hz is fine', () => {
    expect(isOnGrid(200_000_226, 226, 1000)).toBe(true);
  });

  test('200.000226 MHz with an even number of channels of width 1808 Hz is not fine', () => {
    expect(isOnGrid(200_000_226, 1808, 1000)).toBe(false);
  });

  test('201 MHz is never fine', () => {
    expect(isOnGrid(201_000_000, 1808.449074, 1000)).toBe(false);
    expect(isOnGrid(201_000_000, 1808.449074, 1001)).toBe(false);
    expect(isOnGrid(201_000_000, 226.056, 1000)).toBe(false);
  });
});

describe('isCentralFrequencyOnChannelGrid', () => {
  const channelWidthHz = 1808.449074;
  const numberOfChannels = 1000;
  const windowBandwidthHz = channelWidthHz * numberOfChannels;
  const minHz = 50_000_000;

  test('returns true for a value already on the grid', () => {
    const aligned = minHz + (numberOfChannels / 2 + 42) * channelWidthHz;
    expect(isCentralFrequencyOnChannelGrid(aligned, channelWidthHz, windowBandwidthHz, minHz)).toBe(
      true
    );
  });

  test('returns false for a value off the grid', () => {
    const aligned = minHz + (numberOfChannels / 2 + 42) * channelWidthHz;
    expect(
      isCentralFrequencyOnChannelGrid(
        aligned + channelWidthHz * 0.3,
        channelWidthHz,
        windowBandwidthHz,
        minHz
      )
    ).toBe(false);
  });

  test('tolerates ~1 Hz of rounding noise from a 6-d.p. MHz round-trip', () => {
    const aligned = minHz + (numberOfChannels / 2 + 42) * channelWidthHz;
    const roundedHz = Number((aligned / 1e6).toFixed(6)) * 1e6;
    expect(
      isCentralFrequencyOnChannelGrid(roundedHz, channelWidthHz, windowBandwidthHz, minHz)
    ).toBe(true);
  });

  test('returns true when channel width is not positive', () => {
    expect(isCentralFrequencyOnChannelGrid(123_456, 0, windowBandwidthHz, minHz)).toBe(true);
  });
});

describe('isCentralFrequencyDivisible', () => {
  const channelWidthHz = 781250; // 781250 Hz coarse channel

  test('returns true for a value at a half-channel offset from 0', () => {
    expect(isCentralFrequencyDivisible(192.5 * channelWidthHz, channelWidthHz)).toBe(true);
  });

  test('returns false for a value at a whole-channel offset from 0', () => {
    expect(isCentralFrequencyDivisible(192 * channelWidthHz, channelWidthHz)).toBe(false);
  });

  test('returns false for an arbitrary off-grid value', () => {
    expect(isCentralFrequencyDivisible(123.456, channelWidthHz)).toBe(false);
  });

  test('returns true when channel width is not positive', () => {
    expect(isCentralFrequencyDivisible(123.456, 0)).toBe(true);
  });

  test('tolerates ~1 Hz of rounding noise from a 6-d.p. MHz round-trip', () => {
    const aligned = 192.5 * channelWidthHz;
    const roundedHz = Number((aligned / 1e6).toFixed(6)) * 1e6;
    expect(isCentralFrequencyDivisible(roundedHz, channelWidthHz)).toBe(true);
  });
});

describe('coarseChannelRangeToHz', () => {
  test('matches the real LOW OSD values (min 64, max 447, width 781250 Hz)', () => {
    const range = coarseChannelRangeToHz(64, 447, 781250);
    expect(range.minHz).toBeCloseTo(49_609_375, 6);
    expect(range.maxHz).toBeCloseTo(349_609_375, 6);
  });
});
