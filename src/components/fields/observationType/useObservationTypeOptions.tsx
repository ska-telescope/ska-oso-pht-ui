import React from 'react';
import { obTypeTransform } from '@utils/helpers.ts';
import { subarrayConfigurationLow, subarrayConfigurationMid } from '@/utils/types/observatoryData';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

/**
 * Returns the observation type options available for the given subarray, based on its cbfModes.
 */
export function useObservationTypeOptions(subarray: string, isLow: boolean) {
  const { t } = useScopedTranslation();
  const { osdLOW, osdMID } = useOSDAccessors();

  return React.useMemo(() => {
    const obj = isLow ? osdLOW : osdMID;
    const rec =
      (obj?.subArrays as (subarrayConfigurationLow | subarrayConfigurationMid)[] | undefined)?.find(
        (r) => r.subArray === subarray
      ) ?? null;
    const modes = obTypeTransform(rec?.cbfModes ?? []);
    return modes.map((mode) => ({
      label: t(`observationType.${mode}`),
      value: mode
    }));
  }, [subarray, isLow, osdLOW, osdMID, t]);
}
