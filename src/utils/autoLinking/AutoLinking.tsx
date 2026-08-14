import {
  CHANNELS_OUT_DEFAULT,
  CHANNELS_OUT_MAX_COMBINED,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  IMAGE_SIZE_DEFAULT,
  IMAGE_SIZE_UNIT_DEFAULT,
  IW_UNIFORM,
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_UNIT_DEFAULT,
  POLARISATIONS_DEFAULT,
  PULSAR_TIMING_VALUE,
  ROBUST_DEFAULT,
  STATUS_ERROR,
  TAPER_DEFAULT,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import {
  generateCalibrationId,
  generateDataProductId,
  generateObsSetId,
  getDefaultObservationLowAA2
} from '../helpers';
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
import Target from '../types/target';
import Proposal from '@utils/types/proposal.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import getSensCalc from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts';

interface DefaultsResults {
  success: boolean;
  error?: string;
}

const RECOGNISED_OBSERVATION_MODES = [TYPE_CONTINUUM, TYPE_ZOOM, TYPE_PST, TYPE_CONTINUUM_SPECTRAL];

/**
 * Builds a new default observation for the given mode.
 *
 * For a recognised mode we deliberately want to force it back to the actually selected mode so
 * that it can be used downstream in the panel/field selection.
 * For an unrecognised mode use continuum as a fallback rather than pass on a string that would
 * not be recognised downstream and silently default to PST.
 * DEFAULT_ZOOM_OBSERVATION_LOW's zoomChannels is a static placeholder overriden with the real cap
 * to be used once this is available.
 */
export const newObservationForMode = (
  observationMode: string,
  maxZoomChannels?: number
): Observation => {
  const defaultObservation = getDefaultObservationLowAA2(observationMode);
  return {
    ...defaultObservation,
    id: generateObsSetId(),
    type: RECOGNISED_OBSERVATION_MODES.includes(observationMode)
      ? observationMode
      : defaultObservation.type,
    ...(observationMode === TYPE_ZOOM && maxZoomChannels ? { zoomChannels: maxZoomChannels } : {})
  };
};

export const newCalibrationStrategy = (observationId: string): CalibrationStrategy => {
  return {
    observatoryDefined: true,
    id: generateCalibrationId(),
    observationIdRef: observationId,
    calibrators: null,
    notes: null
  };
};

/**
 * Builds the default data product for the given observation's mode.
 */
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
    case TYPE_CONTINUUM_SPECTRAL:
      return {
        imageSizeValue: IMAGE_SIZE_DEFAULT,
        imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
        pixelSizeValue: PIXEL_SIZE_DEFAULT,
        pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
        weighting: IW_UNIFORM,
        polarisations: POLARISATIONS_DEFAULT,
        channelsOut: CHANNELS_OUT_MAX_COMBINED,
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

/**
 * Builds the hidden companion data product (written to the proposal but not displayed) for the
 * given observation's mode, or null for modes that don't have one.
 */
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
    id: generateDataProductId(),
    observationId: observation.id,
    data
  };

  const hiddenData = HiddenSDPData(observation);
  if (hiddenData) {
    const hiddenDataProduct = {
      id: generateDataProductId(),
      observationId: observation.id,
      data: hiddenData
    };
    return [newDSP, hiddenDataProduct];
  }

  return [newDSP];
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

  const sensCalcResult = await getSensCalc(newObservation, target, mainDataProduct);

  if (sensCalcResult?.statusGUI == STATUS_ERROR) {
    return { success: false, error: sensCalcResult.error };
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
