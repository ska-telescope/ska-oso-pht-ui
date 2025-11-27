import { DEFAULT_OBSERVATIONS_LOW_AA2 } from '../constants';
import { generateId } from '../helpers';
import { CalibrationStrategy } from '../types/calibrationStrategy';
import { DataProductSDP } from '../types/dataProduct';

export const observationOut = (obsMode: number) => {
  const defaultObs = DEFAULT_OBSERVATIONS_LOW_AA2[obsMode];
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

export const dataProductSDPOut = (observationId: string) => {
  // default continuum data product
  // TODO modify based on observation type
  const newDataProductSDP: DataProductSDP = {
    id: generateId('SDP-'),
    dataProductType: 1,
    observationId: observationId,
    imageSizeValue: 1,
    imageSizeUnits: 0,
    pixelSizeValue: 1,
    pixelSizeUnits: 2,
    weighting: 1,
    polarisations: [],
    channelsOut: 1,
    fitSpectralPol: 3,
    robust: -1,
    taperValue: 1,
    timeAveraging: -1,
    frequencyAveraging: -1,
    bitDepth: 0,
    continuumSubtraction: false
  };
  return newDataProductSDP;
};
