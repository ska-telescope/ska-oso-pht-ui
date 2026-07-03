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
    entry => !isFineZoomRestricted(subarrayConfig) || entry.bandWidthValue >= FIRST_COARSE_ZOOM
  ).map(entry => ({
    value: entry.bandWidthValue,
    label: `${parseResolutionHz(entry.value).toFixed(DECIMAL_PLACES)} Hz`
  }));

export const getZoomResolutionHz = (bandwidthIndex: number): number => {
  const entry = OSD_CONSTANTS.SpectralResolutionObLowZoom.find(
    e => e.bandWidthValue === bandwidthIndex
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

// Working assumption pending confirmation of the exact central-frequency constraint (TBC):
// the first channel of the zoom window sits on an integer multiple of channel width, i.e. legal
// centre frequencies fall on the channel-centre grid (n + 0.5) * channelWidthHz. Mirrors
// ska-oso-odt-ui's spectralWindow.ts zod constraint ("The first channel of the SPW must be even").
export const snapCentralFrequencyToLegalHz = (
  freqHz: number,
  channelWidthHz: number,
  minHz: number,
  maxHz: number
): number => {
  if (channelWidthHz <= 0) return freqHz;
  const n = Math.round(freqHz / channelWidthHz - 0.5);
  return Math.min(Math.max((n + 0.5) * channelWidthHz, minHz), maxHz);
};

export const stepCentralFrequencyHz = (
  freqHz: number,
  direction: 1 | -1,
  channelWidthHz: number,
  minHz: number,
  maxHz: number
): number => {
  const legal = snapCentralFrequencyToLegalHz(freqHz, channelWidthHz, minHz, maxHz);
  return Math.min(Math.max(legal + direction * channelWidthHz, minHz), maxHz);
};
