import { useOSD } from '../useOSD/useOSD';
import { presentDate, presentTime } from '@/utils/present/present';

export function useOSDAccessors() {
  const osd = useOSD();

  const capabilities = osd?.capabilities;
  const observatoryPolicy = osd?.observatoryPolicy;
  const cycleInformation = observatoryPolicy?.cycleInformation;

  const format = (val: string) => val?.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T');
  const present = (val: string, shouldPresent: boolean) =>
    shouldPresent ? `${presentDate(val)} ${presentTime(val)}` : val;

  return {
    osdLOW: capabilities?.low,
    osdMID: capabilities?.mid,
    osdCycleDescription: observatoryPolicy?.cycleDescription,
    osdCycleId: cycleInformation?.cycleId,
    osdCloses: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalClose), shouldPresent),
    osdOpens: (shouldPresent = false) =>
      present(format(cycleInformation?.proposalOpen), shouldPresent)
  };
}
