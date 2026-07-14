import { ConfigurationBackend } from '@/utils/types/configuration';

export const MockConfigurationBackend: ConfigurationBackend = {
  ska_low: {
    frequency_band: {
      min_coarse_channel: 64,
      max_coarse_channel: 447,
      coarse_channel_width_hz: 781250
    }
  }
};
