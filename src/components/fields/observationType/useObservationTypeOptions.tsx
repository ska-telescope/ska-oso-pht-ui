import React from 'react';
import { subarrayConfigurationLow, subarrayConfigurationMid } from '@/utils/types/observatoryData';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import {
  OBSERVING_MODE_TRANSLATION_KEY,
  observingModesFor,
  type ObservingMode
} from '@/models/proposals/observations';

/**
 * Returns the observing mode options available for the given subarray, based on its cbfModes.
 */
export function useObservationTypeOptions(
  subarray: string,
  isLow: boolean
): { label: string; value: ObservingMode }[] {
  const { t } = useScopedTranslation();
  const { osdLOW, osdMID } = useOSDAccessors();

  return React.useMemo(() => {
    const obj = isLow ? osdLOW : osdMID;
    const rec =
      (obj?.subArrays as (subarrayConfigurationLow | subarrayConfigurationMid)[] | undefined)?.find(
        (r) => r.subArray === subarray
      ) ?? null;
    return observingModesFor(rec?.cbfModes ?? []).map((mode) => ({
      label: t(`observationType.${OBSERVING_MODE_TRANSLATION_KEY[mode]}`),
      value: mode
    }));
  }, [subarray, isLow, osdLOW, osdMID, t]);
}
