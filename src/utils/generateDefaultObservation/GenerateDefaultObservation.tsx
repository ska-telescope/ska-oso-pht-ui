import {
  DEFAULT_DATA_PRODUCT_CONTINUUM,
  DEFAULT_DATA_PRODUCT_PST,
  DEFAULT_DATA_PRODUCT_SPECTRAL,
  DEFAULT_OBSERVATIONS_LOW_AA2,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '../constants';
import { generateId } from '../helpers';
import { CalibrationStrategy } from '../types/calibrationStrategy';
import { DataProductSDP } from '../types/dataProduct';

export const observationOut = (obsMode: number) => {
  const defaultObs = DEFAULT_OBSERVATIONS_LOW_AA2[obsMode];
  defaultObs.id = generateId('obs-', 6);
  return defaultObs;
};

export const calibrationOut = (observationId: string) => {
  const newCalibration: CalibrationStrategy = {
    observatoryDefined: true,
    id: generateId('cal-'),
    observationIdRef: observationId,
    calibrators: null,
    notes: null,
    isAddNote: false
  };
  return newCalibration;
};

export const dataProductSDPOut = (observationId: string, observationType: number) => {
  const newDSP: DataProductSDP =
    observationType === TYPE_CONTINUUM
      ? DEFAULT_DATA_PRODUCT_CONTINUUM
      : observationType === TYPE_ZOOM
      ? DEFAULT_DATA_PRODUCT_SPECTRAL
      : DEFAULT_DATA_PRODUCT_PST;

  newDSP.id = generateId('SDP-', 6);
  newDSP.observationId = observationId;

  return newDSP;
};
