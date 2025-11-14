import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useOSD } from '../useOSD/useOSD';
import { presentDate, presentTime } from '@/utils/present/present';
import { MOCK_CALL } from '@/utils/constants';

export function useOSDAccessors() {
  const osd = useOSD();
  const { t } = useTranslation();

  const capabilities = osd?.capabilities;
  const observatoryPolicy = osd?.observatoryPolicy;
  const cycleInformation = observatoryPolicy?.cycleInformation;
  const observatoryConstants = OSD_CONSTANTS;

  const format = (val: string) => val?.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T');
  const present = (val: string, shouldPresent: boolean) =>
    shouldPresent ? `${presentDate(val)} ${presentTime(val)}` : val;

  const [countdown, setCountdown] = useState<string | null>(null);

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

    updateCountdown(); // initial call
    const interval = setInterval(updateCountdown, 1000); // update every second

    return () => clearInterval(interval); // cleanup
  }, [cycleInformation?.proposalClose, t]);

  return {
    osdLOW: capabilities?.low,
    osdMID: MOCK_CALL ? null : capabilities?.mid,
    osdCapabilities: capabilities,
    osdCycleDescription: observatoryPolicy?.cycleDescription,
    osdCycleId: cycleInformation?.cycleId,
    observatoryConstants: observatoryConstants,
    osdCloses: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalClose), shouldPresent),
    osdOpens: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalOpen), shouldPresent),
    osdCountdown: countdown
  };
}
