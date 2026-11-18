import { AxiosAuthClient } from '@services/axios/axiosAuthClient/axiosAuthClient';
import { generateCalibrationId } from '@/utils/helpers';
import { withZoomChannels } from '@/utils/autoLinking/AutoLinking';
import type { ProposalFormAccess } from './proposal';
import {
  isImageDataProduct,
  newDataProduct,
  pstDataProductKind,
  updateImageSizes
} from './dataProducts';
import { lookupCalibrators } from './calibrationOperations';
import { legacyObservationsFromForm } from './legacyObservations';
import { ObservationInput, OBSERVING_MODE } from './observations';

/*
 * What a change to an observation changes elsewhere in the proposal: its data products and its
 * calibration. Each is applied to the proposal form, after the observation in it has changed.
 */

/** The observation's images are sized for its central frequency, which is in MHz. */
export const resizeImageDataProducts = (
  form: ProposalFormAccess,
  observation: ObservationInput
) => {
  const centralFrequencyMhz = observation.centralFrequency.value;
  if (centralFrequencyMhz === null) {
    return;
  }
  form.setValue(
    'dataProducts',
    form
      .getValues('dataProducts')
      .map((dp) =>
        dp.observationId === observation.id && isImageDataProduct(dp)
          ? updateImageSizes(dp, centralFrequencyMhz)
          : dp
      )
  );
};

/** A spectral image has the observation's channels. */
export const setSpectralChannelsOut = (form: ProposalFormAccess, observation: ObservationInput) => {
  if (observation.observingMode !== OBSERVING_MODE.SPECTRAL) {
    return;
  }
  form.setValue(
    'dataProducts',
    form
      .getValues('dataProducts')
      .map((dp) =>
        dp.observationId === observation.id ? withZoomChannels(dp, observation.zoomChannels) : dp
      )
  );
};

/**
 * A PST observation's one data product is of the kind its PST mode needs, so it starts again with
 * that kind's defaults. It keeps its identifier, so its link still points at it.
 */
export const replacePstDataProduct = (form: ProposalFormAccess, observation: ObservationInput) => {
  if (observation.observingMode !== OBSERVING_MODE.PST) {
    return;
  }
  const dataProducts = form.getValues('dataProducts');
  const current = dataProducts.find((dp) => dp.observationId === observation.id);
  if (!current) {
    return;
  }
  form.setValue('dataProducts', [
    ...dataProducts.filter((dp) => dp.observationId !== observation.id),
    { ...newDataProduct(pstDataProductKind(observation.pstMode), observation.id), id: current.id }
  ]);
};

/** Whether what the calibrators depend on, the telescope and integration time, has changed. */
export const calibratorInputsChanged = (
  previous: ObservationInput | undefined,
  next: ObservationInput | undefined
) =>
  previous?.telescope !== next?.telescope ||
  JSON.stringify(previous?.integrationTime) !== JSON.stringify(next?.integrationTime);

/**
 * The calibrators depend on the observation's telescope and integration time, so they are looked
 * up again for its linked target. They are applied only if, when the lookup returns, the target is
 * still linked and the observation still has the values they were looked up for: otherwise a
 * newer change has asked again. The calibration keeps its notes.
 */
export async function refreshCalibrators(
  form: ProposalFormAccess,
  observationId: string,
  authAxiosClient: AxiosAuthClient
): Promise<void> {
  const findObservation = () =>
    form.getValues('observations').find((obs) => obs.id === observationId);
  const observation = findObservation();
  const link = form
    .getValues('targetObservation')
    .find((rec) => rec.observationId === observationId);
  const target = form.getValues('targets').find((tgt) => tgt.id === link?.targetId);
  if (!observation || !target) {
    return;
  }

  // The calibrator lookup still takes the legacy observation. An incomplete one has none.
  const [legacyObservation] = legacyObservationsFromForm([observation]).observations;
  const calibrators = await lookupCalibrators(authAxiosClient, legacyObservation, target);

  const stillLinked = form
    .getValues('targetObservation')
    .some((rec) => rec.observationId === observationId && rec.targetId === target.id);
  if (!stillLinked || calibratorInputsChanged(observation, findObservation())) {
    return;
  }
  const strategies = form.getValues('calibrationStrategy');
  form.setValue(
    'calibrationStrategy',
    strategies.some((cal) => cal.observationIdRef === observationId)
      ? strategies.map((cal) =>
          cal.observationIdRef === observationId ? { ...cal, calibrators } : cal
        )
      : [
          ...strategies,
          {
            observatoryDefined: true,
            id: generateCalibrationId(),
            observationIdRef: observationId,
            calibrators,
            notes: null
          }
        ]
  );
}
