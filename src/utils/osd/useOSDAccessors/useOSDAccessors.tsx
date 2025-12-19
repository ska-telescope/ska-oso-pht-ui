import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { find } from 'lodash';
import { useOSD } from '../useOSD/useOSD';
import { presentDate, presentTime } from '@/utils/present/present';
import { BAND_LOW_STR, TELESCOPE_LOW_NUM, TELESCOPE_MID_NUM } from '@/utils/constants';

export function useOSDAccessors() {
  const osd = useOSD();
  const { t } = useTranslation();
  const { application, updateAppContent8 } = storageObject.useStore();

  const capabilities = osd?.capabilities;
  const policies = osd?.policies ?? [];
  const observatoryConstants = OSD_CONSTANTS;

  let selectedPolicy: typeof policies[number] | null = null;
  if (Array.isArray(application.content8)) {
    selectedPolicy = application.content8[0] ?? null;
  } else {
    selectedPolicy = application.content8 as typeof policies[number] | null;
  }

  if (!selectedPolicy && policies.length > 0) {
    const now = new Date();
    const active = policies.find(p => {
      const openStr = p.cycleInformation?.proposalOpen;
      const closeStr = p.cycleInformation?.proposalClose;
      if (!openStr || !closeStr) return false;
      const open = new Date(openStr);
      const close = new Date(closeStr);
      return open <= now && now <= close;
    });
    const fallback = active ?? policies[0];
    updateAppContent8(fallback);
    selectedPolicy = fallback;
  }

  const setSelectedPolicyByCycleId = (cycleId: string) => {
    const match = policies.find(p => p.cycleInformation?.cycleId === cycleId);
    if (match) {
      updateAppContent8(match);
    }
  };

  const getCycle = (cycleId: string) => {
    return policies.find(p => p.cycleInformation?.cycleId === cycleId) ?? null;
  };

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

  const autoLink = cyclePolicies?.maxTargets === 1 && cyclePolicies?.maxObservations === 1;

  const isSV = useMemo(() => {
    return (selectedPolicy?.type?.toLowerCase() ?? '').includes('science verification') ?? false;
  }, [selectedPolicy]);

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

  // Helpful: expose the selected cycleId for robust comparisons
  const selectedCycleId = selectedPolicy?.cycleInformation?.cycleId ?? null;

  return {
    osdPolicies: policies,
    selectedPolicy,
    selectedCycleId,
    setSelectedPolicyByCycleId,
    setSelectedPolicy: updateAppContent8,
    getCycle,

    osdLOW: capabilities?.low,
    osdMID: capabilities?.mid,
    osdCapabilities: capabilities,

    osdCycleDescription: selectedPolicy?.cycleDescription,
    osdCycleId: cycleInformation?.cycleId,
    osdCyclePolicy: cyclePolicies,

    observatoryConstants,

    osdCloses: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalClose), shouldPresent),
    osdOpens: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalOpen), shouldPresent),
    osdCountdown: countdown,
    isCustomAllowed,
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
    },

    autoLink,
    isSV
  };
}
