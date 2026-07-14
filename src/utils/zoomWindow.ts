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

// Same coarse-channel range that constrains the continuum, converted to Hz. The
// number_zoom_channels_per_coarse_channel term cancels out of the equivalent channel-count
// version of this formula, so it comes out resolution-independent.
export const coarseChannelRangeToHz = (
  minCoarseChannel: number,
  maxCoarseChannel: number,
  coarseChannelWidthHz: number
): { minHz: number; maxHz: number } => ({
  minHz: (minCoarseChannel - 0.5) * coarseChannelWidthHz,
  maxHz: (maxCoarseChannel + 0.5) * coarseChannelWidthHz
});

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
  return clampCentralFrequencyToWindowHz(stepped, windowBandwidthHz, minHz, maxHz);
};
