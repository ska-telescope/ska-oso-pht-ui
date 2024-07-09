import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from './constants';
import Proposal from './types/proposal';

export const validateObservationPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const hasObservations = () => proposal?.observations?.length > 0;
  const hasTargetObservations = () => proposal?.targetObservation?.length > 0;

  let count = hasObservations() ? 1 : 0;
  count += hasTargetObservations() ? 1 : 0;
  return result[count];
};

export const validateProposal = (proposal: Proposal) => {
  // const observationPageResult = validateObservationPage(proposal);
};
