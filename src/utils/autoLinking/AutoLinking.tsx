import { DEFAULT_DATA_PRODUCT, DEFAULT_OBSERVATIONS_LOW_AA2, TYPE_PST } from '../constants';
import { generateId } from '../helpers';
import { calculateSensCalcData } from '../sensCalc/sensCalc';
import { CalibrationStrategy } from '../types/calibrationStrategy';
import { DataProductSDP } from '../types/dataProduct';
import Observation from '../types/observation';
import { SensCalcResults } from '../types/sensCalcResults';
import Target from '../types/target';

interface DefaultsResults {
  success: boolean;
  error?: string;
}

export const observationOut = (obsMode: number) => {
  const defaultObs: Observation = {
    ...DEFAULT_OBSERVATIONS_LOW_AA2[obsMode], // TODO make this smarter / more generic for when not only low aa2 will be used
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
    polarisations: observationType === TYPE_PST ? ['X'] : ['I', 'XX'] // TODO change PST polarisations to 'X' when pdm updated
  };

  return newDSP;
};

const getSensCalcData = async (
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDP
): Promise<SensCalcResults | string> => {
  const response = await calculateSensCalcData(observation, target, dataProductSDP);
  if (response?.error) {
    const errMsg = response?.error;
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
  addNewTarget: boolean, // new target is added when called from target entry page, but not from general page
  getProposal: Function,
  setProposal: Function
) => {
  const updatedProposal = {
    ...getProposal(),
    targets: addNewTarget ? [...(getProposal().targets ?? []), newTarget] : getProposal().targets,
    observations: [newObservation].filter((obs): obs is Observation => obs !== undefined),
    dataProductSDP: [...(getProposal().dataProductSDP ?? []), newDataProductSDP as DataProductSDP],
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
    calibrationStrategy: [
      ...(getProposal().calibrationStrategy ?? []),
      newCalibration as CalibrationStrategy
    ]
  };
  setProposal(updatedProposal);
};

export default async function autoLinking(
  target: Target,
  getProposal: Function,
  setProposal: Function,
  addNewTarget: boolean = false
): Promise<DefaultsResults> {
  const newObservation = observationOut(getProposal().scienceCategory as number);
  const newDataProductSDP = dataProductSDPOut(newObservation?.id, getProposal().scienceCategory);
  const sensCalcResult = await getSensCalcData(newObservation, target, newDataProductSDP);
  if (typeof sensCalcResult === 'string') {
    return { success: false, error: sensCalcResult };
  }
  const newCalibration = calibrationOut(newObservation?.id);

  updateProposal(
    target,
    newObservation,
    newCalibration,
    newDataProductSDP,
    sensCalcResult,
    addNewTarget,
    getProposal,
    setProposal
  );
  return { success: true };
}
