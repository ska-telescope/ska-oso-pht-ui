import { DEFAULT_DATA_PRODUCT, DEFAULT_OBSERVATIONS_LOW_AA2, TYPE_PST } from '../constants';
import { generateId } from '../helpers';
import { CalibrationStrategy } from '../types/calibrationStrategy';
import { DataProductSDP } from '../types/dataProduct';
import Observation from '../types/observation';

export const observationOut = (obsMode: number) => {
  const defaultObs: Observation = {
    ...DEFAULT_OBSERVATIONS_LOW_AA2[obsMode],
    id: generateId('obs-', 6)
  };

  return defaultObs;
};

export const calibrationOut = (observationId: string) => {
  const newCalibration: CalibrationStrategy = {
    observatoryDefined: true,
    id: generateId('cal-', 6),
    observationIdRef: observationId,
    calibrators: null,
    notes: null,
    isAddNote: false
  };
  return newCalibration;
};

export const dataProductSDPOut = (observationId: string, observationType: number) => {
  const newDSP: DataProductSDP = {
    ...DEFAULT_DATA_PRODUCT,
    id: generateId('SDP-', 6),
    observationId,
    polarisations: observationType === TYPE_PST ? ['XX'] : ['I', 'XX'] // TODO change PST polarisations to 'X' when pdm updated
  };

  return newDSP;
};
