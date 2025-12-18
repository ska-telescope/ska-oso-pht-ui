import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { find } from 'lodash';
import { useOSD } from '../useOSD/useOSD';
import { presentDate, presentTime } from '@/utils/present/present';
import { BAND_LOW_STR, TELESCOPE_LOW_NUM, TELESCOPE_MID_NUM } from '@/utils/constants';

export function useOSDAccessors() {
  const osd = useOSD();
  const { t } = useTranslation();

  const capabilities = osd?.capabilities;
  const observatoryPolicy = osd?.observatoryPolicy;
  const cycleInformation = observatoryPolicy?.cycleInformation;
  const cyclePolicies = observatoryPolicy?.cyclePolicies;
  const observatoryConstants = OSD_CONSTANTS;

  const format = (val: string) => val?.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T');
  const present = (val: string, shouldPresent: boolean) =>
    shouldPresent ? `${presentDate(val)} ${presentTime(val)}` : val;

  const [countdown, setCountdown] = useState<string | null>(null);

  const isCustomAllowed = (telescopeNumber: number) => {
    const bandArray =
      telescopeNumber === TELESCOPE_LOW_NUM ? cyclePolicies?.low : cyclePolicies?.mid;
    return Array.isArray(bandArray) && bandArray.includes('custom');
  };

  useEffect(() => {
    if (!cycleInformation?.proposalClose) return;

    const formatted = format(cycleInformation.proposalClose);
    const closeDate = new Date(formatted);

    const updateCountdown = () => {
      const now = new Date();
      const diffMs = closeDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown(t('cycleCloses.countdown', { days: 0, hours: 0, minutes: 0, seconds: 0 }));
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setCountdown(t('cycleCloses.countdown', { days, hours, minutes, seconds }));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [cycleInformation?.proposalClose, t]);

  return {
    osdLOW: capabilities?.low,
    osdMID: capabilities?.mid,
    osdCapabilities: capabilities,
    //
    osdCycleDescription: observatoryPolicy?.cycleDescription,
    osdCycleId: cycleInformation?.cycleId,
    osdCyclePolicy: observatoryPolicy?.cyclePolicies,
    //
    observatoryConstants: observatoryConstants,
    //
    osdCloses: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalClose), shouldPresent),
    osdOpens: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalOpen), shouldPresent),
    osdCountdown: countdown,
    isCustomAllowed: isCustomAllowed,
    //
    telescopeBand: (observingBand: string) =>
      observingBand === BAND_LOW_STR ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM,
    findBand: (observingBand: string) => {
      if (observingBand === BAND_LOW_STR) {
        return capabilities?.low?.basicCapabilities || null;
      }
      return (
        find(capabilities?.mid?.basicCapabilities?.receiverInformation, { rxId: observingBand }) ||
        null
      );
    }
  };
}
