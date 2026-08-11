import { DECIMAL_PLACES, FIRST_COARSE_ZOOM, SA_AA2, SA_AA_STAR } from './constants';
import { OSD_CONSTANTS } from './OSDConstants';

export interface ZoomResolutionOption {
  value: number;
  label: string;
}

// At the moment only the course zoom modes are available for AA2 and AA* subarrays
// (i.e. zoom modes 1-4 are not available for these subarrays).
export const isFineZoomRestricted = (subarrayConfig?: string): boolean =>
  subarrayConfig === SA_AA2 || subarrayConfig === SA_AA_STAR;

const parseResolutionHz = (label: string): number => Number(label.split(' ')[0]);

export const getZoomResolutionOptions = (subarrayConfig?: string): ZoomResolutionOption[] =>
  OSD_CONSTANTS.SpectralResolutionObLowZoom.filter(
    (entry) => !isFineZoomRestricted(subarrayConfig) || entry.bandWidthValue >= FIRST_COARSE_ZOOM
  ).map((entry) => ({
    value: entry.bandWidthValue,
    label: `${parseResolutionHz(entry.value).toFixed(DECIMAL_PLACES)} Hz`
  }));

export const getZoomResolutionHz = (bandwidthIndex: number): number => {
  const entry = OSD_CONSTANTS.SpectralResolutionObLowZoom.find(
    (e) => e.bandWidthValue === bandwidthIndex
  );
  return entry ? parseResolutionHz(entry.value) : 0;
};

export const channelsToBandwidthHz = (channels: number, resolutionHz: number): number =>
  channels * resolutionHz;

export const bandwidthHzToChannels = (
  bandwidthHz: number,
  resolutionHz: number,
  maxChannels: number
): number => {
  if (resolutionHz <= 0) return 0;
  return Math.min(Math.max(Math.round(bandwidthHz / resolutionHz), 1), maxChannels || 1);
};

export const stepChannels = (channels: number, direction: 1 | -1, maxChannels: number): number =>
  Math.min(Math.max(channels + direction, 1), maxChannels || 1);

export const clampCentralFrequencyToWindowHz = (
  freqHz: number,
  windowBandwidthHz: number,
  minHz: number,
  maxHz: number
): number => {
  const halfWindow = windowBandwidthHz / 2;
  const lowerBound = minHz + halfWindow;
  const upperBound = maxHz - halfWindow;
  if (upperBound < lowerBound) return (minHz + maxHz) / 2;
  return Math.min(Math.max(freqHz, lowerBound), upperBound);
};

// The band is divided into channels of width channelWidthHz starting at minHz, so the window's
// start channel (channel_number) must be an integer:
// central_frequency = minHz + (channel_number + number_of_channels / 2) * channelWidthHz
export const snapCentralFrequencyToChannelGridHz = (
  freqHz: number,
  channelWidthHz: number,
  numberOfChannels: number,
  minHz: number
): number => {
  if (channelWidthHz <= 0) return freqHz;
  const startChannel = Math.round((freqHz - minHz) / channelWidthHz - numberOfChannels / 2);
  return minHz + (startChannel + numberOfChannels / 2) * channelWidthHz;
};

// Checks (rather than corrects) whether freqHz already sits on the grid that
// snapCentralFrequencyToChannelGridHz snaps to. Tolerance is in Hz, not a fraction of a channel -
// values commonly round-trip through a 6-d.p. MHz display, which alone can introduce ~0.5 Hz of
// noise, easily dwarfing a fixed fractional-channel tolerance when channelWidthHz is small.
export const isCentralFrequencyOnChannelGrid = (
  freqHz: number,
  channelWidthHz: number,
  windowBandwidthHz: number,
  minHz: number
): boolean => {
  if (channelWidthHz <= 0) return true;
  const numberOfChannels = windowBandwidthHz / channelWidthHz;
  const gridHz = snapCentralFrequencyToChannelGridHz(
    freqHz,
    channelWidthHz,
    numberOfChannels,
    minHz
  );
  return Math.abs(freqHz - gridHz) < 1;
};

// A valid continuum/PST central frequency sits at a half-coarse-channel offset from absolute
// 0 Hz, so the SPW's first coarse channel is even. Tolerance is in Hz, not a fraction of a
// channel - mirrors isCentralFrequencyOnChannelGrid above, since values commonly round-trip
// through a 6-d.p. MHz display, which alone can introduce ~0.5 Hz of noise that a strict
// Number.isInteger check can't absorb.
export const isCentralFrequencyDivisible = (cfValueHz: number, channelWidthHz: number): boolean => {
  if (channelWidthHz <= 0) return true;
  const nearestValidChannelPair = Math.round((cfValueHz / channelWidthHz + 0.5) / 2);
  const gridHz = (2 * nearestValidChannelPair - 0.5) * channelWidthHz;
  return Math.abs(cfValueHz - gridHz) < 1;
};

export const stepCentralFrequencyHz = (
  freqHz: number,
  direction: 1 | -1,
  channelWidthHz: number,
  windowBandwidthHz: number,
  minHz: number,
  maxHz: number
): number => {
  const numberOfChannels = channelWidthHz > 0 ? windowBandwidthHz / channelWidthHz : 0;
  const stepped = snapCentralFrequencyToChannelGridHz(
    freqHz + direction * channelWidthHz,
    channelWidthHz,
    numberOfChannels,
    minHz
  );
  const clamped = clampCentralFrequencyToWindowHz(stepped, windowBandwidthHz, minHz, maxHz);
  if (
    clamped === stepped ||
    channelWidthHz <= 0 ||
    isCentralFrequencyOnChannelGrid(clamped, channelWidthHz, windowBandwidthHz, minHz)
  ) {
    return clamped;
  }
  // Clamping (a raw arithmetic boundary) pulled the value off the channel grid - e.g. when
  // correcting down from a value way above the band's max, the snap-then-clamp above lands
  // exactly on that boundary, which usually isn't itself a valid grid point. Re-snap towards the
  // interior of the window (floor when clamping pulled the value down to the upper edge, ceil
  // when it pushed the value up to the lower edge) so the corrected value is always genuinely
  // on-grid, without spilling back past the boundary that was just enforced.
  const rawStartChannel = (clamped - minHz) / channelWidthHz - numberOfChannels / 2;
  const startChannel =
    clamped < stepped ? Math.floor(rawStartChannel + 1e-6) : Math.ceil(rawStartChannel - 1e-6);
  return minHz + (startChannel + numberOfChannels / 2) * channelWidthHz;
};
