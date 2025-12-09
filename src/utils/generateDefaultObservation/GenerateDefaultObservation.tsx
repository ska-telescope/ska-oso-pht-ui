import { DEFAULT_DATA_PRODUCT, DEFAULT_OBSERVATIONS_LOW_AA2, TYPE_PST } from '../constants';
import { generateId } from '../helpers';
import { calculateSensCalcData } from '../sensCalc/sensCalc';
import { CalibrationStrategy } from '../types/calibrationStrategy';
import { DataProductSDP } from '../types/dataProduct';
import Observation from '../types/observation';
import { SensCalcResults } from '../types/sensCalcResults';
import Target from '../types/target';

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

const getSensCalcData = async (
  observation: Observation,
  target: Target
): Promise<SensCalcResults | any> => {
  const response = await calculateSensCalcData(observation, target);
  if (response.error) {
    const errMsg = response.error;
    return errMsg;
  }
  return response;
};

const updateProposal = (
  newTarget: Target,
  newObservation: Observation,
  newCalibration: CalibrationStrategy,
  newDataProductSDP: DataProductSDP,
  sensCalcResult: any,
  autoLink: boolean,
  getProposal: Function,
  setProposal: Function
) => {
  const updatedProposal = {
    ...getProposal(),
    targets: [...(getProposal().targets ?? []), newTarget],
    observations: autoLink
      ? [newObservation].filter((obs): obs is Observation => obs !== undefined)
      : getProposal().observations,
    dataProductSDP: autoLink
      ? [...(getProposal().dataProductSDP ?? []), newDataProductSDP as DataProductSDP]
      : getProposal().dataProductSDP,
    targetObservation: autoLink
      ? sensCalcResult && newObservation && newObservation.id && newDataProductSDP?.id
        ? [
            {
              targetId: newTarget?.id,
              observationId: newObservation?.id,
              dataProductsSDPId: newDataProductSDP.id,
              sensCalc: sensCalcResult
            }
          ]
        : []
      : getProposal().targetObservation,
    calibrationStrategy: autoLink
      ? [...(getProposal().calibrationStrategy ?? []), newCalibration as CalibrationStrategy]
      : getProposal().calibrationStrategy
  };
  setProposal(updatedProposal);
};

export const generateDefaults = async (
  target: Target,
  getProposal: Function,
  setProposal: Function,
  autoLink: boolean
): Promise<any | void> => {
  let newObservation = undefined;
  let newDataProductSDP = undefined;
  let sensCalcResult = undefined;
  let newCalibration = undefined;
  if (autoLink && typeof getProposal().scienceCategory === 'number') {
    newObservation = observationOut(getProposal().scienceCategory as number);
    newDataProductSDP = dataProductSDPOut(newObservation?.id, getProposal().scienceCategory);
    sensCalcResult = await getSensCalcData(newObservation, target);
    if (typeof sensCalcResult === 'string') {
      return { success: false, error: sensCalcResult };
    }
    newCalibration = calibrationOut(newObservation?.id);

    updateProposal(
      target,
      newObservation,
      newCalibration,
      newDataProductSDP,
      sensCalcResult,
      autoLink,
      getProposal,
      setProposal
    );
    return { success: true };
  }
};
