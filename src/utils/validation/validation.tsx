import { getSubmitPageStatuses } from '@/models/proposals/submit';
import type { ProposalType } from '@/models/proposals/proposal';
import { PROPOSAL_TYPE, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from './../constants';
import Proposal from './../types/proposal';
import { useOSDAccessors } from '../osd/useOSDAccessors/useOSDAccessors';
import { getTitleSchema } from '../../models/proposals/title';
import { getDetailsSchema } from '@/models/proposals/details';

export const validateTitlePage = (proposal: Pick<Proposal, 'title' | 'proposalType'>) => {
  if (!getTitleSchema().safeParse(proposal?.title ?? '').success) {
    return STATUS_ERROR;
  }
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;
  if (proposal?.title?.length > 0) {
    count++;
  }
  if (proposal?.proposalType) {
    count++;
  }
  return result[count];
};

export const validateTeamPage = (proposal: Pick<Proposal, 'investigators'>) => {
  const result = [STATUS_ERROR, STATUS_OK];
  const count = Array.isArray(proposal.investigators) && proposal.investigators.length > 0 ? 1 : 0;
  return result[count];
};

export const validateDetailsPage = (proposal: Proposal) => {
  const abstract = proposal?.abstract ?? '';
  if (abstract.length > 0 && !getDetailsSchema().shape.abstract.safeParse(abstract).success) {
    return STATUS_ERROR;
  }
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;

  if ((proposal?.abstract ?? '').length > 0) {
    count++;
  }
  const hasCategoryOrMode =
    proposal?.proposalType === PROPOSAL_TYPE.SCIENCE_VERIFICATION
      ? (proposal?.observations?.length ?? 0) > 0
      : proposal?.scienceCategory !== null;
  if (hasCategoryOrMode) {
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

export const validateTechnicalPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.technicalPDF && typeof proposal?.technicalPDF === 'object' ? 1 : 0;
  count += count && proposal?.technicalPDF?.isUploadedPdf ? 1 : 0;
  return result[count];
};

export const useValidateProposal = () => {
  const { osdLOW, osdMID } = useOSDAccessors();

  return (proposal: Proposal, values: ProposalType) => {
    const submitStatuses = getSubmitPageStatuses(values, { low: osdLOW, mid: osdMID });
    return [
      validateTitlePage(proposal),
      validateTeamPage(proposal),
      validateDetailsPage(proposal),
      validateSciencePage(proposal),
      submitStatuses.target,
      submitStatuses.observation,
      validateTechnicalPage(proposal),
      submitStatuses.dataProducts,
      submitStatuses.linking,
      submitStatuses.calibration
    ];
  };
};

/** The codes the sky direction and radial motion checks return when a value is wrong. */
export const VALUE_ERROR = { FORMAT: '0', RANGE: '1' } as const;
export type ValueError = (typeof VALUE_ERROR)[keyof typeof VALUE_ERROR];

export function validateRightAscension(value: string): ValueError | null {
  const formatValid = /^\+?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return VALUE_ERROR.FORMAT;
  }
  const arr = value.split(':');
  if (arr?.length !== 3) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[0]) > 24) {
    return VALUE_ERROR.RANGE;
  }
  if (Number(arr[1]) > 59) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[2]) >= 60) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[0]) === 24 && (Number(arr[1]) > 0 || Number(arr[2]) > 0)) {
    return VALUE_ERROR.RANGE;
  }
  return null;
}

export function validateDeclination(value: string): ValueError | null {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return VALUE_ERROR.FORMAT;
  }

  const arr = value.split(':');
  if (arr.length !== 3) {
    return VALUE_ERROR.FORMAT;
  }

  const hours = Number(arr[0]);
  const minutes = Number(arr[1]);
  const seconds = Number(arr[2].split('.')[0]);

  if (Math.abs(hours) > 90 || (Math.abs(hours) === 90 && (minutes > 0 || seconds > 0))) {
    return VALUE_ERROR.RANGE;
  }

  // explicitly treat these as a format rather than a range error
  // because they are not valid in the context of sky direction
  if (minutes > 59) {
    return VALUE_ERROR.FORMAT;
  }
  if (seconds > 59) {
    return VALUE_ERROR.FORMAT;
  }
  return null;
}

export function validateRadialMotion(value: string): ValueError | null {
  if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(value)) {
    return VALUE_ERROR.FORMAT;
  }

  return null;
}
