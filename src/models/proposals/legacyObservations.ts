import Observation from '@utils/types/observation';
import GroupObservation from '@utils/types/groupObservation';
import { getGroupObservations, getObservations } from '@services/axios/get/getProposal/getProposal';
import { getObservationsSets } from '@services/axios/put/putProposal/putProposalMapping';
import { TYPE_CONTINUUM, TYPE_CONTINUUM_SPECTRAL, TYPE_PST, TYPE_ZOOM } from '@utils/constants';
import {
  getObservationSchema,
  ObservationInput,
  ObservingMode,
  OBSERVING_MODE,
  observationsFromPdm,
  observationsToPdm
} from './observations';

/*
 * TODO: Delete once nothing reads observations from the legacy store.
 *
 * The legacy store keeps observations in its own shape until their readers move to the form. Both
 * directions go through the PDM with the existing mappers, so the store holds what a save and a
 * reload of the form would give.
 */

/** The form's observations in the legacy store's shape. Incomplete ones can't be saved, so they're left out. */
export const legacyObservationsFromForm = (observations: ObservationInput[]) => {
  const valid = observations.flatMap((observation) => {
    const result = getObservationSchema().safeParse(observation);
    return result.success ? [result.data] : [];
  });
  const observationSets = observationsToPdm(valid);
  return {
    observations: getObservations(observationSets),
    groupObservations: getGroupObservations(observationSets) as GroupObservation[]
  };
};

/** The legacy store's observations in the form's shape. */
export const formObservationsFromLegacy = (
  observations: Observation[] | null | undefined,
  groupObservations: GroupObservation[] | null | undefined
): ObservationInput[] =>
  observationsFromPdm(getObservationsSets(observations ?? [], groupObservations ?? []));

/** The observing mode of each legacy observation type, which the observing mode options still use. */
export const OBSERVING_MODE_BY_LEGACY_TYPE: Record<string, ObservingMode> = {
  [TYPE_CONTINUUM]: OBSERVING_MODE.CONTINUUM,
  [TYPE_CONTINUUM_SPECTRAL]: OBSERVING_MODE.CONTINUUM_SPECTRAL,
  [TYPE_ZOOM]: OBSERVING_MODE.SPECTRAL,
  [TYPE_PST]: OBSERVING_MODE.PST
};
