import {
  CHANNELS_OUT_DEFAULT,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  IMAGE_SIZE_DEFAULT,
  IMAGE_SIZE_UNIT_DEFAULT,
  IW_UNIFORM,
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_UNIT_DEFAULT,
  POLARISATIONS_DEFAULT,
  PULSAR_TIMING_VALUE,
  REFERENCE_COORDINATE_TYPE_SSO,
  ROBUST_DEFAULT,
  TAPER_DEFAULT,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
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
import Proposal from '@utils/types/proposal.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';

interface DefaultsResults {
  success: boolean;
  error?: string;
}

const RECOGNISED_OBSERVATION_MODES = [TYPE_CONTINUUM, TYPE_ZOOM, TYPE_PST, TYPE_CONTINUUM_SPECTRAL];

export const newObservationForMode = (
  observationMode: string,
  maxZoomChannels?: number
): Observation => {
  const defaultObservation = getDefaultObservationLowAA2(observationMode);
  return {
    ...defaultObservation,
    id: generateId('obs-', 6),
    // getDefaultObservationLowAA2 falls back to the continuum defaults object for modes that
    // reuse its field values (e.g. combined mode), which bakes in `type: TYPE_CONTINUUM` - force
    // it back to the actually-selected mode so downstream panel/field selection sees it. Only do
    // this for a recognised mode though - an unsupported/missing one should keep the continuum
    // fallback type getDefaultObservationLowAA2 already returned, not the raw (possibly garbage)
    // input string, which several downstream switches would otherwise silently treat as PST via
    // their `case TYPE_PST: default:` fallthrough.
    type: RECOGNISED_OBSERVATION_MODES.includes(observationMode)
      ? observationMode
      : defaultObservation.type,
    // DEFAULT_ZOOM_OBSERVATION_LOW's zoomChannels is a static placeholder (1000) with no
    // knowledge of the actual subarray's channel cap - override it with the real cap when the
    // caller has it available, rather than baking the placeholder into the saved observation.
    ...(observationMode === TYPE_ZOOM && maxZoomChannels ? { zoomChannels: maxZoomChannels } : {})
  };
};

export const newCalibrationStrategy = (observationId: string): CalibrationStrategy => {
  return {
    observatoryDefined: true,
    id: generateId('cal-', 6),
    observationIdRef: observationId,
    calibrators: null,
    notes: null
  };
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
    case TYPE_CONTINUUM_SPECTRAL:
      return {
        imageSizeValue: IMAGE_SIZE_DEFAULT,
        imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
        pixelSizeValue: PIXEL_SIZE_DEFAULT,
        pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
        weighting: IW_UNIFORM,
        polarisations: POLARISATIONS_DEFAULT,
        channelsOut: CHANNELS_OUT_DEFAULT,
        robust: ROBUST_DEFAULT,
        taperValue: TAPER_DEFAULT,
        continuumSubtraction: true
      } as SDPSpectralData;
    default:
      return {
        continuumSubtraction: true,
        dataProductType: DP_TYPE_IMAGES,
        imageSizeValue: IMAGE_SIZE_DEFAULT,
        imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
        pixelSizeValue: PIXEL_SIZE_DEFAULT,
        pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
        weighting: IW_UNIFORM,
        polarisations: POLARISATIONS_DEFAULT,
        channelsOut: CHANNELS_OUT_DEFAULT,
        robust: ROBUST_DEFAULT,
        taperValue: TAPER_DEFAULT
      } as SDPImageContinuumData;
  }
};

export const HiddenSDPData = (
  observation: Observation
):
  | SDPImageContinuumData
  | SDPVisibilitiesContinuumData
  | SDPSpectralData
  | SDPFilterbankPSTData
  | SDPTimingPSTData
  | SDPFlowthroughPSTData
  | null => {
  switch (observation.type) {
    case TYPE_PST:
      return null;
    case TYPE_ZOOM:
      return {
        dataProductType: DP_TYPE_VISIBLE,
        timeAveraging: 4,
        frequencyAveraging: 1
      } as SDPVisibilitiesContinuumData;
    case TYPE_CONTINUUM:
      return {
        dataProductType: DP_TYPE_VISIBLE,
        timeAveraging: 4,
        frequencyAveraging: 4
      } as SDPVisibilitiesContinuumData;
    case TYPE_CONTINUUM_SPECTRAL:
      return {
        dataProductType: DP_TYPE_VISIBLE,
        timeAveraging: 4,
        frequencyAveraging: 1
      } as SDPVisibilitiesContinuumData;
    default:
      return null;
  }
};

export const newDataProductsForMode = (observation: Observation) => {
  const data = SDPData(observation);
  const newDSP: DataProductSDPNew = {
    id: generateId('SDP-', 6),
    observationId: observation.id,
    data
  };

  const hiddenData = HiddenSDPData(observation);
  if (hiddenData) {
    const hiddenDataProduct = {
      id: generateId('SDP-', 6),
      observationId: observation.id,
      data: hiddenData
    };
    return [newDSP, hiddenDataProduct];
  }

  return [newDSP];
};

const getSensCalcData = async (
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults | string> => {
  const response = await calculateSensCalcData(observation, target, dataProductSDP);
  return response?.error ? response?.error : (response as SensCalcResults);
};

export default async function autoLinking(
  target: Target,
  getProposal: Function,
  setProposal: Function,
  observationMode?: string, // science category is used for observation mode on SV
  abstract?: string | undefined,
  maxZoomChannels?: number
): Promise<DefaultsResults> {
  /**
   * This function is used to automatically create an observing set up and data products
   * when a target is added, and link them in the Proposal. It is also called again if the target or observing mode is changed.
   * This is useful UX for the SV call as only one observation is allowed.
   **/

  if (!observationMode) {
    observationMode = getProposal().scienceCategory;
  }
  if (!abstract) {
    abstract = getProposal().abstract;
  }

  const newObservation = newObservationForMode(observationMode as string, maxZoomChannels);

  const newDataProducts = newDataProductsForMode(newObservation);

  // For the SV call, we want the Proposal to contain both data products (where applicable)
  // but only the one the user selects in the dropdown to be linked via the results
  const mainDataProduct = newDataProducts[0];

  const isSSO = target.kind === REFERENCE_COORDINATE_TYPE_SSO.value;

  let sensCalcResult = undefined;

  if (!isSSO) {
    sensCalcResult = await getSensCalcData(newObservation, target, mainDataProduct);

    const isValidSensCalcResult = (r: any): boolean =>
      !!r &&
      !r.error && // { error: string } failures
      !r.detail && // { title, detail } validation failures
      Array.isArray(r.section1); // a real result has sections; failures don't

    // if a specific error message from backend → surface it
    if (typeof sensCalcResult === 'string') {
      return { success: false, error: 'autoLink.errorNoSensCalcResponse' };
    }

    if (!isValidSensCalcResult(sensCalcResult)) {
      return { success: false, error: 'autoLink.errorNoSensCalcResponse' };
    }
  }

  const targetObservation: TargetObservation = {
    targetId: target?.id,
    observationId: newObservation?.id,
    dataProductsSDPId: mainDataProduct.id,
    sensCalc: sensCalcResult
  };

  const calibrationStrategy = newCalibrationStrategy(newObservation?.id);

  const updatedProposal: Proposal = {
    ...getProposal(),
    scienceCategory: observationMode,
    scienceSubCategory: [1],
    abstract: abstract,
    targets: [target],
    observations: [newObservation],
    dataProductSDP: newDataProducts,
    targetObservation: [targetObservation],
    calibrationStrategy: [calibrationStrategy]
  };

  setProposal(updatedProposal);

  return { success: true };
}
