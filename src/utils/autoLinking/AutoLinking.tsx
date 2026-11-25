import { buildCalibrationStrategy } from '@/models/proposals/calibrationOperations';
import type { ProposalFormAccess, ProposalType } from '@/models/proposals/proposal';
import {
  PROPOSAL_TYPE,
  SENSITIVITY_STATE,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import { generateDataProductId, generateObsSetId, getDefaultObservationLowAA2 } from '../helpers';
import { CalibrationStrategy } from '../types/calibrationStrategy';
import {
  DATA_PRODUCT_KIND,
  DataProductInput,
  DataProductKind,
  newDataProduct,
  pstDataProductKind,
  STEPPED_FIELD,
  steppedFromPdm
} from '@/models/proposals/dataProducts';
import Observation from '../types/observation';
import Target from '../types/target';
import Proposal from '@utils/types/proposal.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { AxiosAuthClient } from '@services/axios/axiosAuthClient/axiosAuthClient.ts';

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

/** The kind of the observation's main data product, the one its link points at. */
export const mainDataProductKind = (observation: Observation): DataProductKind => {
  switch (observation.type) {
    case TYPE_PST:
      return pstDataProductKind(observation.pstMode);
    case TYPE_ZOOM:
      return DATA_PRODUCT_KIND.SPECTRAL_IMAGE;
    case TYPE_CONTINUUM_SPECTRAL:
      return DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE;
    default:
      return DATA_PRODUCT_KIND.CONTINUUM_IMAGE;
  }
};

/**
 * A spectral image's output channels are the observation's zoom channels, which the page shows and
 * the backend is sent. Other data products are left as they are.
 */
export const withZoomChannels = (
  dataProduct: DataProductInput,
  observation: Observation
): DataProductInput =>
  dataProduct.kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE && observation.zoomChannels !== undefined
    ? { ...dataProduct, channelsOut: observation.zoomChannels }
    : dataProduct;

/**
 * The default data products for the observation's mode: the main one, which the link points at,
 * and for imaging modes a hidden visibilities companion (saved but not displayed).
 */
export const newDataProductsForMode = (observation: Observation): DataProductInput[] => {
  const main = withZoomChannels(
    newDataProduct(mainDataProductKind(observation), observation.id),
    observation
  );
  if (observation.type === TYPE_PST) {
    return [main];
  }
  const companion: DataProductInput = {
    id: generateDataProductId(),
    observationId: observation.id,
    kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
    timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
    frequencyAveragingKhz: steppedFromPdm(
      observation.type === TYPE_CONTINUUM ? 4 : 1,
      STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ
    )
  };
  return [main, companion];
};

/**
 * Builds the link of a target to an observation and its main data product, with the calibrators
 * for them. The link is marked partial: the sensitivity service calculates its results.
 */
const buildTargetLink = async (
  target: Target,
  observation: Observation,
  mainDataProduct: DataProductInput,
  form: ProposalFormAccess,
  authAxiosClient: AxiosAuthClient
): Promise<{ targetObservation: TargetObservation; calibrationStrategy: CalibrationStrategy }> => {
  const targetObservation: TargetObservation = {
    targetId: target?.id,
    observationId: observation.id,
    dataProductsSDPId: mainDataProduct.id,
    sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
  };

  const existingNotes = form.getValues('calibrationStrategy')?.[0]?.notes ?? null;

  const calibrationStrategy = await buildCalibrationStrategy(authAxiosClient, {
    observationId: observation.id,
    observation,
    target,
    notes: existingNotes
  });

  return { targetObservation, calibrationStrategy };
};

/**
 * Writes a target link to the form, which owns the targets, links and calibration.
 */
const setTargetLink = (
  form: ProposalFormAccess,
  target: Target,
  link: { targetObservation: TargetObservation; calibrationStrategy: CalibrationStrategy }
) => {
  form.setValue('targets', [target]);
  form.setValue('targetObservation', [link.targetObservation]);
  form.setValue('calibrationStrategy', [link.calibrationStrategy]);
};

/**
 * Replaces the observation and data products of a proposal based on given mode,
 * and links them to the target with a new calibration. Used when the observing mode changes.
 * The sensitivity service calculates the new link's results.
 */
export async function regenerateForMode(
  target: Target,
  getProposal: Function,
  setProposal: Function,
  form: ProposalFormAccess,
  authAxiosClient: AxiosAuthClient,
  observationMode?: string,
  maxZoomChannels?: number
): Promise<void> {
  const mode = observationMode ?? getProposal().observations?.[0]?.type ?? TYPE_CONTINUUM;
  const newObservation = newObservationForMode(mode, maxZoomChannels);
  const newDataProducts = newDataProductsForMode(newObservation);
  const link = await buildTargetLink(
    target,
    newObservation,
    newDataProducts[0],
    form,
    authAxiosClient
  );

  setTargetLink(form, target, link);
  form.setValue('dataProducts', newDataProducts);
  setProposal({ ...getProposal(), observations: [newObservation] });
}

/**
 * Links a target to the existing observation and data products of a proposal in a cycle
 * that allows only one target and observation (autoLink), adding the calibration for it. The
 * sensitivity service calculates the link's results. A default continuum observation is created
 * if there is none yet.
 */
export async function linkTarget(
  target: Target,
  getProposal: Function,
  setProposal: Function,
  form: ProposalFormAccess,
  authAxiosClient: AxiosAuthClient
): Promise<void> {
  const proposal: Proposal = getProposal();
  const observation = proposal.observations?.[0] ?? newObservationForMode(TYPE_CONTINUUM);
  const dataProducts = form.getValues('dataProducts');
  const observationDataProducts = dataProducts.filter((dp) => dp.observationId === observation.id);
  const newDataProducts = observationDataProducts.length ? [] : newDataProductsForMode(observation);
  // The main data product comes first; the others are hidden companions
  const mainDataProduct = observationDataProducts[0] ?? newDataProducts[0];

  const link = await buildTargetLink(target, observation, mainDataProduct, form, authAxiosClient);

  setTargetLink(form, target, link);
  form.setValue('dataProducts', [...form.getValues('dataProducts'), ...newDataProducts]);
  setProposal({ ...getProposal(), observations: [observation] });
}

/**
 * An SV proposal loaded with a target but no link gets its observation's default data products
 * back, linked to the target. This happens when its main data product was invalid when it was
 * last saved, so it and its link were left out. The calibration belongs to the observation, so it
 * is kept. The sensitivity service calculates the new link's results.
 */
export const relinkSvTarget = (values: ProposalType, observations: Observation[]): ProposalType => {
  const [target] = values.targets;
  if (
    values.proposalType !== PROPOSAL_TYPE.SCIENCE_VERIFICATION ||
    observations.length !== 1 ||
    !target ||
    values.targetObservation.length > 0
  ) {
    return values;
  }
  const [observation] = observations;
  // Any data product left from the save is replaced too, with the full default set
  const dataProducts = newDataProductsForMode(observation);
  return {
    ...values,
    dataProducts: [
      ...values.dataProducts.filter((dp) => dp.observationId !== observation.id),
      ...dataProducts
    ],
    targetObservation: [
      {
        targetId: target.id,
        observationId: observation.id,
        dataProductsSDPId: dataProducts[0].id,
        sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
      }
    ]
  };
};

/**
 * Sets the observing mode of a proposal with a single observation (e.g. SV).
 *
 * With a target, the observation, data products, link and calibration are all regenerated for
 * the new mode via regenerateForMode. Without one, only a default observation and data products
 * for the mode are created, as the link and calibration need a target; linkTarget adds these once
 * a target is added.
 */
export async function setObservingMode(
  observationMode: string,
  getProposal: Function,
  setProposal: Function,
  form: ProposalFormAccess,
  authAxiosClient: AxiosAuthClient,
  maxZoomChannels?: number
): Promise<void> {
  const target = form.getValues('targets')?.[0] as Target | undefined;
  if (target) {
    return regenerateForMode(
      target,
      getProposal,
      setProposal,
      form,
      authAxiosClient,
      observationMode,
      maxZoomChannels
    );
  }

  const newObservation = newObservationForMode(observationMode, maxZoomChannels);
  form.setValue('dataProducts', newDataProductsForMode(newObservation));
  setProposal({ ...getProposal(), observations: [newObservation] });
}
