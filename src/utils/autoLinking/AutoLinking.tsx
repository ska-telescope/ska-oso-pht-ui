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
import { legacyObservationsFromForm } from '@/models/proposals/legacyObservations';
import Target from '../types/target';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { AxiosAuthClient } from '@services/axios/axiosAuthClient/axiosAuthClient.ts';

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
  target: Target,
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

  // The calibrator lookup still takes the legacy observation. An incomplete one has none.
  const [legacyObservation] = legacyObservationsFromForm([observation]).observations;
  const calibrators = await lookupCalibrators(authAxiosClient, legacyObservation, target);
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
  target: Target,
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

/**
 * An SV proposal loaded with a target but no link gets its observation's default data products
 * back, linked to the target. This happens when its main data product was invalid when it was
 * last saved, so it and its link were left out. The calibration belongs to the observation, so it
 * is kept. The sensitivity service calculates the new link's results.
 */
export const relinkSvTarget = (values: ProposalType): ProposalType => {
  const [target] = values.targets;
  if (
    values.proposalType !== PROPOSAL_TYPE.SCIENCE_VERIFICATION ||
    values.observations.length !== 1 ||
    !target ||
    values.targetObservation.length > 0
  ) {
    return values;
  }
  const [observation] = values.observations;
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

  const target = form.getValues('targets')?.[0] as Target | undefined;
  if (target) {
    await linkObservation(form, target, observation, dataProducts[0], authAxiosClient);
  }
}
