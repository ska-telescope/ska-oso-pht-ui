import { lookupCalibrators } from '@/models/proposals/calibrationOperations';
import type { ProposalFormAccess, ProposalType } from '@/models/proposals/proposal';
import { PROPOSAL_TYPE, SENSITIVITY_STATE } from '../constants';
import { generateCalibrationId, generateDataProductId } from '../helpers';
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
import {
  newSvObservation,
  ObservationInput,
  ObservingMode,
  OBSERVING_MODE
} from '@/models/proposals/observations';
import type { TargetInput } from '@/models/proposals/targets';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { AxiosAuthClient } from '@services/axios/axiosAuthClient/axiosAuthClient.ts';
import { PstMode } from '@/generated/models';

/** The kind of the observation's main data product, the one its link points at. */
export const mainDataProductKind = (observation: ObservationInput): DataProductKind => {
  switch (observation.observingMode) {
    case OBSERVING_MODE.PST:
      return pstDataProductKind(observation.pstMode);
    case OBSERVING_MODE.SPECTRAL:
      return DATA_PRODUCT_KIND.SPECTRAL_IMAGE;
    case OBSERVING_MODE.CONTINUUM_SPECTRAL:
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
  zoomChannels: number | null
): DataProductInput =>
  dataProduct.kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE && zoomChannels !== null
    ? { ...dataProduct, channelsOut: zoomChannels }
    : dataProduct;

/**
 * The default data products for the observation's mode: the main one, which the link points at,
 * and for imaging modes a hidden visibilities companion (saved but not displayed).
 */
export const newDataProductsForMode = (observation: ObservationInput): DataProductInput[] => {
  const main = withZoomChannels(
    newDataProduct(mainDataProductKind(observation), observation.id),
    observation.observingMode === OBSERVING_MODE.SPECTRAL ? observation.zoomChannels : null
  );
  if (observation.observingMode === OBSERVING_MODE.PST) {
    return [main];
  }
  const companion: DataProductInput = {
    id: generateDataProductId(),
    observationId: observation.id,
    kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
    timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
    frequencyAveragingKhz: steppedFromPdm(
      observation.observingMode === OBSERVING_MODE.CONTINUUM ? 4 : 1,
      STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ
    )
  };
  return [main, companion];
};

/**
 * Links the target to the observation and its main data product, with a new calibration for
 * them. Everything is written to the form straight away, so no page sees a half-changed proposal;
 * only the calibrators are added later, when their lookup returns. The link is marked partial:
 * the sensitivity service calculates its results.
 */
const linkObservation = async (
  form: ProposalFormAccess,
  target: TargetInput,
  observation: ObservationInput,
  mainDataProduct: DataProductInput,
  authAxiosClient: AxiosAuthClient
): Promise<void> => {
  const targetObservation: TargetObservation = {
    targetId: target.id,
    observationId: observation.id,
    dataProductsSDPId: mainDataProduct.id,
    sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
  };
  const calibrationStrategy: CalibrationStrategy = {
    observatoryDefined: true,
    id: generateCalibrationId(),
    observationIdRef: observation.id,
    calibrators: null,
    notes: form.getValues('calibrationStrategy')?.[0]?.notes ?? null
  };
  form.setValue('targets', [target]);
  form.setValue('targetObservation', [targetObservation]);
  form.setValue('calibrationStrategy', [calibrationStrategy]);

  const calibrators = await lookupCalibrators(authAxiosClient, observation, target);
  // Only while this calibration is still there: another change may have replaced it meanwhile.
  // The notes are the ones there now, which the author may have edited during the lookup.
  const strategies = form.getValues('calibrationStrategy');
  if (strategies.some((cal) => cal.id === calibrationStrategy.id)) {
    form.setValue(
      'calibrationStrategy',
      strategies.map((cal) => (cal.id === calibrationStrategy.id ? { ...cal, calibrators } : cal))
    );
  }
};

/**
 * Links a target to the existing observation and data products of a proposal in a cycle
 * that allows only one target and observation (autoLink), adding the calibration for it. The
 * sensitivity service calculates the link's results. A default continuum observation is created
 * if there is none yet.
 */
export async function linkTarget(
  target: TargetInput,
  form: ProposalFormAccess,
  authAxiosClient: AxiosAuthClient,
  minElevation: number | null
): Promise<void> {
  const observation =
    form.getValues('observations')[0] ?? newSvObservation(OBSERVING_MODE.CONTINUUM, minElevation);
  const dataProducts = form.getValues('dataProducts');
  const observationDataProducts = dataProducts.filter((dp) => dp.observationId === observation.id);
  const newDataProducts = observationDataProducts.length ? [] : newDataProductsForMode(observation);
  // The main data product comes first; the others are hidden companions
  const mainDataProduct = observationDataProducts[0] ?? newDataProducts[0];

  form.setValue('observations', [observation]);
  form.setValue('dataProducts', [...dataProducts, ...newDataProducts]);
  await linkObservation(form, target, observation, mainDataProduct, authAxiosClient);
}

// The data product a link points at; an imaging observation also has a hidden visibilities one
const isMainDataProduct = (dataProduct: DataProductInput) =>
  dataProduct.kind !== DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES;

/** The default SV observation for the mode of the given main data product, or continuum. */
const svObservationFor = (
  dataProduct: DataProductInput | undefined,
  minElevation: number | null
): ObservationInput => {
  switch (dataProduct?.kind) {
    case DATA_PRODUCT_KIND.SPECTRAL_IMAGE:
      // A spectral image's channels out are the observation's zoom channels
      return newSvObservation(OBSERVING_MODE.SPECTRAL, minElevation, dataProduct.channelsOut);
    case DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE:
      return newSvObservation(OBSERVING_MODE.CONTINUUM_SPECTRAL, minElevation);
    case DATA_PRODUCT_KIND.PST_FLOW_THROUGH:
      return newSvObservation(OBSERVING_MODE.PST, minElevation, undefined, PstMode.FlowThrough);
    case DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK:
      return newSvObservation(
        OBSERVING_MODE.PST,
        minElevation,
        undefined,
        PstMode.DetectedFilterbank
      );
    case DATA_PRODUCT_KIND.PST_TIMING:
      return newSvObservation(OBSERVING_MODE.PST, minElevation, undefined, PstMode.PulsarTiming);
    default:
      return newSvObservation(OBSERVING_MODE.CONTINUUM, minElevation);
  }
};

/**
 * An SV proposal has the observation, data products and link the app sets up for it, as the user
 * can't add them. A loaded SV proposal gets back any of these a save left out because they were
 * invalid:
 * - No observation: the default one for the mode of the data products kept for it, with the ID
 *   they and the calibration still refer to, so they belong to it again. Continuum if there are none.
 * - No main data product: the observation's default data products, replacing any left without it.
 * - A target without a link, or a new observation: the link. The sensitivity service calculates
 *   its results.
 */
export const withSvDefaults = (values: ProposalType, minElevation: number | null): ProposalType => {
  if (values.proposalType.type !== PROPOSAL_TYPE.SCIENCE_VERIFICATION) {
    return values;
  }
  const [target] = values.targets;
  const missingObservation = values.observations.length === 0;
  const missingMainDataProduct = !values.dataProducts.some(isMainDataProduct);
  // A new observation needs a new link, as the results were for the old one
  const missingLink = !!target && (missingObservation || values.targetObservation.length === 0);
  if (!missingObservation && !missingMainDataProduct && !missingLink) {
    return values;
  }

  const savedObservationId =
    values.dataProducts[0]?.observationId ?? values.calibrationStrategy[0]?.observationIdRef;
  const observation = missingObservation
    ? {
        ...svObservationFor(values.dataProducts.find(isMainDataProduct), minElevation),
        ...(savedObservationId && { id: savedObservationId })
      }
    : values.observations[0];
  const dataProducts = missingMainDataProduct
    ? newDataProductsForMode(observation)
    : values.dataProducts;
  const mainDataProduct = dataProducts.find(isMainDataProduct) as DataProductInput;

  return {
    ...values,
    observations: [observation],
    dataProducts,
    targetObservation: missingLink
      ? [
          {
            targetId: target.id,
            observationId: observation.id,
            dataProductsSDPId: mainDataProduct.id,
            sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
          }
        ]
      : values.targetObservation
  };
};

/**
 * Sets the observing mode of a proposal with a single observation (SV). Each mode has its own
 * defaults, so the observation and its data products are replaced with new ones for the mode.
 * With a target, it is linked to them with a new calibration. Without one, the link and
 * calibration wait for linkTarget, which adds them once a target is added.
 */
export async function setObservingMode(
  observingMode: ObservingMode,
  form: ProposalFormAccess,
  authAxiosClient: AxiosAuthClient,
  minElevation: number | null,
  maxZoomChannels?: number
): Promise<void> {
  const observation = newSvObservation(observingMode, minElevation, maxZoomChannels);
  const dataProducts = newDataProductsForMode(observation);
  form.setValue('observations', [observation]);
  form.setValue('dataProducts', dataProducts);

  const target = form.getValues('targets')?.[0];
  if (target) {
    await linkObservation(form, target, observation, dataProducts[0], authAxiosClient);
  }
}
