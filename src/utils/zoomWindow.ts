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

// The exact centre-frequency legal-value constraint is still TBC - for now, the only rule
// applied is that the whole zoom window (centre +/- half the window bandwidth) stays within
// [minHz, maxHz], not just the centre point itself.
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

export const stepCentralFrequencyHz = (
  freqHz: number,
  direction: 1 | -1,
  channelWidthHz: number,
  windowBandwidthHz: number,
  minHz: number,
  maxHz: number
): number =>
  clampCentralFrequencyToWindowHz(
    freqHz + direction * channelWidthHz,
    windowBandwidthHz,
    minHz,
    maxHz
  );
