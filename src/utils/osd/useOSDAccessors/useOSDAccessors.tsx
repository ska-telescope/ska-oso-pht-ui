import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { useOSD } from '../useOSD/useOSD';
import { presentDate, presentTime } from '@/utils/present/present';
import { TELESCOPE_LOW_NUM } from '@/utils/constants';

export function useOSDAccessors() {
  const osd = useOSD();
  const { t } = useTranslation();

  const capabilities = osd?.capabilities;
  const policies = osd?.policies ?? []; // ✅ all policies
  const observatoryConstants = OSD_CONSTANTS;

  // ✅ selected cycleNumber state
  const [selectedCycleNumber, setSelectedCycleNumber] = useState<number | null>(
    policies.length > 0 ? policies[0].cycleNumber : null
  );

  // ✅ find the selected policy
  const selectedPolicy = useMemo(
    () => policies.find(p => p.cycleNumber === selectedCycleNumber) ?? null,
    [policies, selectedCycleNumber]
  );

  const cycleInformation = selectedPolicy?.cycleInformation;
  const cyclePolicies = selectedPolicy?.cyclePolicies;

  const format = (val: string | undefined) =>
    val?.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T') ?? '';
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
    // ✅ expose all policies
    osdPolicies: policies,
    selectedCycleNumber,
    setSelectedCycleNumber, // ✅ allow changing selection

    // ✅ capabilities
    osdLOW: capabilities?.low,
    osdMID: capabilities?.mid,
    osdCapabilities: capabilities,

    // ✅ relative to selected policy
    osdCycleDescription: selectedPolicy?.cycleDescription,
    osdCycleId: cycleInformation?.cycleId,
    osdCyclePolicy: cyclePolicies,

    observatoryConstants,

    osdCloses: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalClose), shouldPresent),
    osdOpens: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalOpen), shouldPresent),
    osdCountdown: countdown,
    isCustomAllowed
  };
}
