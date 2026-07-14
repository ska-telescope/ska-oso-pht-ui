// Only the fields PHT currently needs from ska-oso-services' /odt/configuration response -
// see getConfiguration.tsx for why that (ODT-owned) endpoint is used here.

export type LowFrequencyBandBackend = {
  min_coarse_channel: number;
  max_coarse_channel: number;
  coarse_channel_width_hz: number;
};

export type ConfigurationBackend = {
  ska_low: {
    frequency_band: LowFrequencyBandBackend;
  };
};

export type LowFrequencyBand = {
  minCoarseChannel: number;
  maxCoarseChannel: number;
  coarseChannelWidthHz: number;
};

export type Configuration = {
  low: LowFrequencyBand;
};

export default Configuration;
