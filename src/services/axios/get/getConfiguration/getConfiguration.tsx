import {
  OSO_SERVICES_ODT_CONFIGURATION_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { MockConfigurationBackend } from './mockConfigurationBackend';
import Configuration, { ConfigurationBackend } from '@/utils/types/configuration';

/*****************************************************************************************************************************/

export const mapConfiguration = (inData: ConfigurationBackend): Configuration => ({
  low: {
    minCoarseChannel: inData?.ska_low?.frequency_band?.min_coarse_channel,
    maxCoarseChannel: inData?.ska_low?.frequency_band?.max_coarse_channel,
    coarseChannelWidthHz: inData?.ska_low?.frequency_band?.coarse_channel_width_hz
  }
});

export function GetMockConfiguration(mock = MockConfigurationBackend): Configuration {
  return mapConfiguration(mock);
}

async function GetConfiguration(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>
): Promise<string | Configuration> {
  if (USE_LOCAL_DATA) {
    return GetMockConfiguration();
  }

  try {
    const result = await authAxiosClient.get(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_ODT_CONFIGURATION_PATH}`
    );
    return typeof result === 'undefined'
      ? 'error.API_UNKNOWN_ERROR'
      : mapConfiguration(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetConfiguration;
