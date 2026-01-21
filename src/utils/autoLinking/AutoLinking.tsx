import {
  DP_TYPE_IMAGES,
  IW_UNIFORM,
  PULSAR_TIMING_VALUE,
  ROBUST_DEFAULT,
  TAPER_DEFAULT,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import { generateId, getDefaultObservationLowAA2 } from '../helpers';
import { calculateSensCalcData } from '../sensCalc/sensCalc';
import { CalibrationStrategy } from '../types/calibrationStrategy';
import {
  DataProductSDPNew,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPTimingPSTData,
  SDPVisibilitiesContinuumData
} from '../types/dataProduct';
import Observation from '../types/observation';
import { SensCalcResults } from '../types/sensCalcResults';
import Target from '../types/target';

interface DefaultsResults {
  success: boolean;
  error?: string;
}

export const observationOut = (obsMode: string) => {
  const defaultObs: Observation = {
    ...getDefaultObservationLowAA2(obsMode),
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
    notes: null
  };
  return newCalibration;
};

export const SDPData = (
  observation: Observation
):
  | SDPImageContinuumData
  | SDPVisibilitiesContinuumData
  | SDPSpectralData
  | SDPFilterbankPSTData
  | SDPTimingPSTData
  | SDPFlowthroughPSTData => {
  switch (observation.type) {
    case TYPE_PST:
      return {
        dataProductType: PULSAR_TIMING_VALUE
      } as SDPFlowthroughPSTData;
    case TYPE_ZOOM:
      return {
        imageSizeValue: 2.5,
        imageSizeUnits: 0,
        pixelSizeValue: 1.6,
        pixelSizeUnits: 2,
        weighting: IW_UNIFORM,
        polarisations: ['I', 'XX'],
        channelsOut: 40,
        robust: ROBUST_DEFAULT,
        taperValue: TAPER_DEFAULT,
        continuumSubtraction: true
      } as SDPSpectralData;
    default:
      return {
        continuumSubtraction: true,
        dataProductType: DP_TYPE_IMAGES,
        imageSizeValue: 2.5,
        imageSizeUnits: 0,
        pixelSizeValue: 1.6,
        pixelSizeUnits: 2,
        weighting: IW_UNIFORM,
        polarisations: ['I', 'XX'],
        channelsOut: 40,
        robust: ROBUST_DEFAULT,
        taperValue: TAPER_DEFAULT
      } as SDPImageContinuumData;
  }
};

export const dataProductSDPOut = (observation: Observation) => {
  const data = SDPData(observation);
  const newDSP: DataProductSDPNew = {
    id: generateId('SDP-', 6),
    observationId: observation.id,
    data
  };

  return newDSP;
};

const getSensCalcData = async (
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults | string> => {
  const response = await calculateSensCalcData(observation, target, dataProductSDP);
  return response?.error ? response?.error : (response as SensCalcResults);
};

const updateProposal = (
  newObsMode: number,
  newAbstract: string | undefined,
  newTarget: Target,
  newObservation: Observation,
  newCalibration: CalibrationStrategy,
  newDataProductSDP: DataProductSDPNew,
  sensCalcResult: any,
  getProposal: Function,
  setProposal: Function
) => {
  const updatedProposal = {
    ...getProposal(),
    scienceCategory: newObsMode,
    scienceSubCategory: [1],
    abstract: newAbstract,
    targets: [...[], newTarget],
    observations: [newObservation].filter((obs): obs is Observation => obs !== undefined),
    dataProductSDP: [...[], newDataProductSDP as DataProductSDPNew],
    targetObservation:
      sensCalcResult && newObservation && newObservation.id && newDataProductSDP?.id
        ? [
            {
              targetId: newTarget?.id,
              observationId: newObservation?.id,
              dataProductsSDPId: newDataProductSDP.id,
              sensCalc: sensCalcResult
            }
          ]
        : [],
    calibrationStrategy: [...[], newCalibration as CalibrationStrategy]
  };
  setProposal(updatedProposal);
};

export default async function autoLinking(
  target: Target,
  getProposal: Function,
  setProposal: Function,
  observationMode?: string, // science category is used for observation mode on SV
  abstract?: string | undefined
): Promise<DefaultsResults> {
  const newObsMode =
    observationMode && observationMode.length > 0 ? observationMode : getProposal().scienceCategory;
  const newAbstract = abstract ?? getProposal().abstract;
  const newObservation = observationOut(newObsMode);
  const newDataProductSDP = dataProductSDPOut(newObservation);
  const sensCalcResult = await getSensCalcData(newObservation, target, newDataProductSDP);
  if (typeof sensCalcResult === 'string') {
    return { success: false, error: sensCalcResult };
  }
  const newCalibration = calibrationOut(newObservation?.id);

  updateProposal(
    newObsMode,
    newAbstract,
    target,
    newObservation,
    newCalibration,
    newDataProductSDP,
    sensCalcResult,
    getProposal,
    setProposal
  );
  return { success: true };
}
