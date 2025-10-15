import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from './../constants';
import Proposal from './../types/proposal';

export const validateTitlePage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;
  if (proposal?.title?.length > 0) {
    count++;
  }
  if (proposal?.proposalType !== 0) {
    count++;
  }
  return result[count];
};

export const validateTeamPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_OK];
  const count = proposal.investigators?.length > 0 ? 1 : 0;
  return result[count];
};

export const validateGeneralPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;

  if (proposal?.abstract?.length > 0) {
    count++;
  }
  if (proposal?.scienceCategory > 0) {
    count++;
  }
  return result[count];
};

export const validateSciencePage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.sciencePDF && typeof proposal?.sciencePDF === 'object' ? 1 : 0;
  count += count && proposal?.sciencePDF?.isUploadedPdf ? 1 : 0;
  return result[count];
};

// TODO : How do we capture and validate for 'No specific target' ?
export const validateTargetPage = (proposal: Proposal) =>
  proposal?.targets?.length ? STATUS_OK : STATUS_ERROR;

export const validateObservationPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const hasObservations = () => proposal?.observations?.length > 0;
  const hasTargetObservations = () => proposal?.targetObservation?.length > 0;

  let count = hasObservations() ? 1 : 0;
  count += hasTargetObservations() ? 1 : 0;
  return result[count];
};

export const validateTechnicalPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.technicalPDF && typeof proposal?.technicalPDF === 'object' ? 1 : 0;
  count += count && proposal?.technicalPDF?.isUploadedPdf ? 1 : 0;
  return result[count];
};

export const validateSDPPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_OK];
  const count = proposal.dataProductSDP?.length > 0 ? 1 : 0;
  return result[count];
};

export const validateSRCPage = () => STATUS_OK;

export const validateCalibrationPage = () => STATUS_OK; // TODO : implement validation logic

export const validateProposal = (proposal: Proposal) => {
  const results = [
    validateTitlePage(proposal),
    validateTeamPage(proposal),
    validateGeneralPage(proposal),
    validateSciencePage(proposal),
    validateTargetPage(proposal),
    validateObservationPage(proposal),
    validateCalibrationPage(),
    validateTechnicalPage(proposal),
    validateSDPPage(proposal),
    validateSRCPage()
  ];
  return results;
};
