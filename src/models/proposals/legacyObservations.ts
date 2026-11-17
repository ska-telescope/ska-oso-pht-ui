import Observation from '@utils/types/observation';
import GroupObservation from '@utils/types/groupObservation';
import { getGroupObservations, getObservations } from '@services/axios/get/getProposal/getProposal';
import { getObservationsSets } from '@services/axios/put/putProposal/putProposalMapping';
import {
  getObservationSchema,
  ObservationInput,
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
