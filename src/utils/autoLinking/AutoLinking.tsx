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

// useful to track down unwanted mutations of observation.type
// function guardTypeMutation<T extends object>(obj: T): T {
//   return new Proxy(obj, {
//     set(target, prop, value, receiver) {
//       if (prop === 'type' && value !== (target as any)[prop]) {
//         console.error('Detected mutation of observation.type', {
//           from: (target as any)[prop],
//           to: value
//         });
//         // Print a stack to see where it came from
//         console.error(new Error('type mutation stack').stack);
//       }
//       return Reflect.set(target, prop, value, receiver);
//     }
//   });
// }

export const observationOut = (obsMode: number) => {
  const defaultObs: Observation = {
    ...DEFAULT_OBSERVATIONS_LOW_AA2[obsMode], // TODO make this smarter / more generic for when not only low aa2 will be used
    id: generateId('obs-', 6)
  };
  // return guardTypeMutation(defaultObs);
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
  target: Target,
  dataProductSDP: DataProductSDP
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
  newDataProductSDP: DataProductSDP,
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
    dataProductSDP: [...[], newDataProductSDP as DataProductSDP],
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
  obsMode: number, // science category is used for observation mode on SV
  abstract: string | undefined
): Promise<DefaultsResults> {
  const newObsmode = obsMode;
  const newAbstract = abstract;
  const newObservation = observationOut(newObsmode);
  const newDataProductSDP = dataProductSDPOut(newObservation?.id, obsMode);
  const sensCalcResult = await getSensCalcData(newObservation, target, newDataProductSDP);
  if (typeof sensCalcResult === 'string') {
    return { success: false, error: sensCalcResult };
  }
  const newCalibration = calibrationOut(newObservation?.id);

  updateProposal(
    newObsmode,
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
