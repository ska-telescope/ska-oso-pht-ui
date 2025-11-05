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
  const hasObservations = () =>
    Array.isArray(proposal?.observations) && proposal.observations.length > 0;

  let count = hasObservations() ? 2 : 0;
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

export const validateCalibrationPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.calibrationStrategy?.length > 0 ? 1 : 0;
  const isAddNote: boolean = proposal?.calibrationStrategy?.[0]?.isAddNote;
  count +=
    count && ((isAddNote && proposal?.calibrationStrategy?.[0]?.notes) || !isAddNote) ? 1 : 0;
  return result[count];
};

export const validateLinkingPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const hasTargetObservations = () => (proposal?.targetObservation?.length ?? 0) > 0;
  let count = hasTargetObservations() ? 2 : 0;
  return result[count];
};

export const validateProposal = (proposal: Proposal) => {
  const results = [
    validateTitlePage(proposal),
    validateTeamPage(proposal),
    validateGeneralPage(proposal),
    validateSciencePage(proposal),
    validateTargetPage(proposal),
    validateObservationPage(proposal),
    validateCalibrationPage(proposal),
    validateTechnicalPage(proposal),
    validateSDPPage(proposal),
    validateSRCPage(),
    validateLinkingPage(proposal)
  ];
  return results;
};

export function validateSkyDirection1Text(value: string): boolean {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+))$/.test(value);
  if (!formatValid) {
    return false;
  }
  const arr = value.split(':');
  if (arr?.length !== 3) {
    return false;
  }
  if (Math.abs(Number(arr[0])) > 24) {
    return false;
  }
  if (Number(arr[1]) > 59) {
    return false;
  }
  if (Number(arr[2]) >= 60) {
    return false;
  }
  return !(Number(arr[0]) === 24 && (Number(arr[1]) > 0 || Number(arr[2]) > 0));
}

export function validateSkyDirection1Number(value: string): boolean {
  // Validate its a valid number
  if (!/^[0-9]*\.?[0-9]+$/.test(value)) {
    return false;
  }
  const number = parseFloat(value);
  // Validate decimal right ascension range.
  return number >= 0 && number < 360;
}

export function validateSkyDirection2Text(value: string): string | null {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(value);
  if (!formatValid) {
    return '0';
  }

  const arr = value.split(':');
  if (arr.length !== 3) {
    return '0';
  }

  const hours = Number(arr[0]);
  const minutes = Number(arr[1]);
  const seconds = Number(arr[2].split('.')[0]); // Ignore fractional part for range check

  if (Math.abs(hours) > 90 || (Math.abs(hours) === 90 && (minutes > 0 || seconds > 0))) {
    return '1';
  }
  if (minutes > 59) {
    return '1';
  }
  if (seconds >= 59) {
    return '1';
  }
  return null;
}

export function validateSkyDirection2Number(value: string): string | null {
  if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(value)) {
    return '0';
  }

  if (parseFloat(value) < -90 || parseFloat(value) > 90) {
    return '1';
  }
  return null;
}
