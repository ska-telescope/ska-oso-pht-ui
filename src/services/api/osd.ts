import type { ObservatoryData, ObservatoryDataBackend } from '@/utils/types/observatoryData';
import type { ODTConfigurationBackend } from '@utils/types/odtConfiguration.tsx';
import { osdMapping } from '@/utils/osd/osdMapping';
import { ODT_CONFIGURATION_FALLBACK } from '@/utils/osd/odtConfigurationFallback';
import { type ApiResult, callApi, handleApiError, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/**
 * Fetches the OSD for all cycles, with the ODT configuration, mapped to the app's observatory
 * data. The cycles are required; without the ODT configuration the fallback one is used.
 */
export const getCycles = async (): Promise<ApiResult<ObservatoryData>> => {
  // TODO: The OSD related endpoints will be consolidated in oso-services in the future, after
  //   which the data should not need to come from two endpoints.
  // Both requests are made together. callApi never throws, so neither can fail the other (as
  // Promise.allSettled would also ensure).
  const [cycles, odtConfig] = await Promise.all([
    callApi(() => api.proposals.getAllOsdCyclesOsoApiV17PhtPrslsOsdCyclesGet()),
    callApi(() => api.odt.configurationGetOsoApiV17OdtConfigurationGet())
  ]);
  if (!cycles.data) {
    return { error: cycles.error ?? UNKNOWN_API_ERROR };
  }

  try {
    // The mapper reads the OSD and ODT configuration through the app's own description of them,
    // which is looser than the generated models
    const cyclesData = cycles.data as unknown as ObservatoryDataBackend[];
    const config =
      (odtConfig.data as unknown as ODTConfigurationBackend | undefined) ??
      ODT_CONFIGURATION_FALLBACK;
    // Reversed, to show LOW AA2 first. Copied first, as reverse() works in place.
    return { data: osdMapping([...cyclesData].reverse(), config) };
  } catch (err) {
    return handleApiError(err);
  }
};
