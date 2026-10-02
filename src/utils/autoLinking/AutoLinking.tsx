import {
  CHANNELS_OUT_DEFAULT,
  CHANNELS_OUT_MAX_COMBINED,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  IMAGE_SIZE_DEFAULT,
  IMAGE_SIZE_UNIT_DEFAULT,
  IMAGE_WEIGHTING_DEFAULT,
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_UNIT_DEFAULT,
  POLARISATIONS_DEFAULT,
  PULSAR_TIMING_VALUE,
  REFERENCE_COORDINATE_TYPE_SSO,
  ROBUST_DEFAULT,
  SET_CONTINUUM_SUBSTRACTION_DEFAULT,
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
import { CalibrationStrategy, Calibrator } from '../types/calibrationStrategy';
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
import { AxiosAuthClient } from '@services/axios/axiosAuthClient/axiosAuthClient.ts';
import GetCalibratorList from '@services/axios/get/getCalibratorList/getCalibratorList.tsx';

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

export const newCalibrationStrategy = async (
  observationId: string,
  authAxiosClient: AxiosAuthClient,
  observation: Observation,
  target: Target,
  notes: string | null = null
): Promise<CalibrationStrategy> => {
  let calibrators: Calibrator[] | null = null;

  if (target.kind !== REFERENCE_COORDINATE_TYPE_SSO.value) {
    const response = await GetCalibratorList(authAxiosClient, observation, target);
    if (typeof response !== 'string') {
      calibrators = response;
    }
  }

  return {
    observatoryDefined: true,
    id: generateCalibrationId(),
    observationIdRef: observationId,
    calibrators,
    notes
  };
};

/**
 * Fields shared by every imaging data product default; each mode overrides only what differs.
 */
const DEFAULT_IMAGING_DATA = {
  imageSizeValue: IMAGE_SIZE_DEFAULT,
  imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
  pixelSizeValue: PIXEL_SIZE_DEFAULT,
  pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
  weighting: IMAGE_WEIGHTING_DEFAULT,
  polarisations: POLARISATIONS_DEFAULT,
  channelsOut: CHANNELS_OUT_DEFAULT,
  robust: ROBUST_DEFAULT,
  taperValue: TAPER_DEFAULT,
  continuumSubtraction: SET_CONTINUUM_SUBSTRACTION_DEFAULT
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
      return { ...DEFAULT_IMAGING_DATA } as SDPSpectralData;
    case TYPE_CONTINUUM_SPECTRAL:
      return {
        ...DEFAULT_IMAGING_DATA,
        channelsOut: CHANNELS_OUT_MAX_COMBINED
      } as SDPSpectralData;
    default:
      return {
        ...DEFAULT_IMAGING_DATA,
        dataProductType: DP_TYPE_IMAGES
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

/**
 * Builds the sensitivity results and calibrators linking a target to an observation
 * and its main data product, or returns the sensitivity calculator error on a failed
 * sensitivity calculation.
 */
const buildTargetLink = async (
  target: Target,
  observation: Observation,
  mainDataProduct: DataProductSDPNew,
  getProposal: Function,
  authAxiosClient: AxiosAuthClient
): Promise<
  | {
      success: true;
      targetObservation: TargetObservation;
      calibrationStrategy: CalibrationStrategy;
    }
  | { success: false; error?: string }
> => {
  const sensCalcResult = await getSensCalc(observation, target, mainDataProduct);

  if (sensCalcResult?.statusGUI == STATUS_ERROR) {
    return { success: false, error: sensCalcResult.error };
  }

  const targetObservation: TargetObservation = {
    targetId: target?.id,
    observationId: observation.id,
    dataProductsSDPId: mainDataProduct.id,
    sensCalc: sensCalcResult
  };

  const existingNotes = getProposal()?.calibrationStrategy?.[0]?.notes ?? null;

  const calibrationStrategy = await newCalibrationStrategy(
    observation.id,
    authAxiosClient,
    observation,
    target,
    existingNotes
  );

  return { success: true, targetObservation, calibrationStrategy };
};

/**
 * Replaces the observation and data products of a proposal based on given mode,
 * and links them to the target with new sensitivity results and calibration.
 * Used when the observing mode changes.
 */
export async function regenerateForMode(
  target: Target,
  getProposal: Function,
  setProposal: Function,
  authAxiosClient: AxiosAuthClient,
  observationMode?: string,
  maxZoomChannels?: number
): Promise<DefaultsResults> {
  const mode = observationMode ?? getProposal().observations?.[0]?.type ?? TYPE_CONTINUUM;
  const newObservation = newObservationForMode(mode, maxZoomChannels);
  const newDataProducts = newDataProductsForMode(newObservation);
  const link = await buildTargetLink(
    target,
    newObservation,
    newDataProducts[0],
    getProposal,
    authAxiosClient
  );

  if (!link.success) {
    return { success: false, error: link.error };
  }

  setProposal({
    ...getProposal(),
    targets: [target],
    observations: [newObservation],
    dataProductSDP: newDataProducts,
    targetObservation: [link.targetObservation],
    calibrationStrategy: [link.calibrationStrategy]
  });

  return { success: true };
}

/**
 * Links a target to the existing observation and data products of a proposal in a cycle
 * that allows only one target and observation (autoLink), adding the sensitivity results
 * and calibration for it. A default continuum observation is created if there is none yet.
 */
export async function linkTarget(
  target: Target,
  getProposal: Function,
  setProposal: Function,
  authAxiosClient: AxiosAuthClient
): Promise<DefaultsResults> {
  const proposal: Proposal = getProposal();
  const observation = proposal.observations?.[0] ?? newObservationForMode(TYPE_CONTINUUM);
  const existingDataProducts = (proposal.dataProductSDP ?? []).filter(
    (dp) => dp.observationId === observation.id
  );
  const newDataProducts = existingDataProducts.length ? [] : newDataProductsForMode(observation);
  const mainDataProduct = existingDataProducts[0] ?? newDataProducts[0];

  const link = await buildTargetLink(
    target,
    observation,
    mainDataProduct,
    getProposal,
    authAxiosClient
  );

  if (!link.success) {
    return { success: false, error: link.error };
  }

  setProposal({
    ...getProposal(),
    targets: [target],
    observations: [observation],
    dataProductSDP: [...(getProposal().dataProductSDP ?? []), ...newDataProducts],
    targetObservation: [link.targetObservation],
    calibrationStrategy: [link.calibrationStrategy]
  });

  return { success: true };
}

/**
 * Sets the observing mode of a proposal with a single observation (e.g. SV).
 *
 * With a target, the observation, data products, results and calibration are all regenerated for
 * the new mode via regenerateForMode. Without one, only a default observation and data products
 * for the mode are created, as results and calibration need a target; linkTarget adds these once
 * a target is added.
 */
export async function setObservingMode(
  observationMode: string,
  getProposal: Function,
  setProposal: Function,
  authAxiosClient: AxiosAuthClient,
  maxZoomChannels?: number
): Promise<DefaultsResults> {
  const target = getProposal().targets?.[0];
  if (target) {
    return regenerateForMode(
      target,
      getProposal,
      setProposal,
      authAxiosClient,
      observationMode,
      maxZoomChannels
    );
  }

  const newObservation = newObservationForMode(observationMode, maxZoomChannels);
  setProposal({
    ...getProposal(),
    observations: [newObservation],
    dataProductSDP: newDataProductsForMode(newObservation)
  });
  return { success: true };
}
