import { getSubmitPageStatuses } from '@/models/proposals/submit';
import type { ProposalType } from '@/models/proposals/proposal';
import { PROPOSAL_TYPE, STATUS_ERROR, STATUS_OK } from './../constants';
import { useOSDAccessors } from '../osd/useOSDAccessors/useOSDAccessors';
import { getTitleSchema } from '../../models/proposals/title';
import { getDetailsSchema } from '@/models/proposals/details';
import { getDocumentPageStatus } from '@/models/proposals/documents';

// Each page is complete or not: the title needs a valid title and a proposal type
export const validateTitlePage = (values: Pick<ProposalType, 'title' | 'proposalType'>) =>
  getTitleSchema().safeParse(values.title).success && values.proposalType !== null
    ? STATUS_OK
    : STATUS_ERROR;

export const validateTeamPage = (values: Pick<ProposalType, 'investigators'>) =>
  values.investigators.length > 0 ? STATUS_OK : STATUS_ERROR;

export const validateDetailsPage = (
  values: Pick<ProposalType, 'abstract' | 'scienceCategory' | 'proposalType' | 'observations'>
) => {
  const hasCategoryOrMode =
    values.proposalType === PROPOSAL_TYPE.SCIENCE_VERIFICATION
      ? values.observations.length > 0
      : values.scienceCategory !== null;
  return getDetailsSchema().shape.abstract.safeParse(values.abstract).success && hasCategoryOrMode
    ? STATUS_OK
    : STATUS_ERROR;
};

export const useValidateProposal = () => {
  const { osdLOW, osdMID } = useOSDAccessors();

  return (values: ProposalType) => {
    const submitStatuses = getSubmitPageStatuses(values, { low: osdLOW, mid: osdMID });
    return [
      validateTitlePage(values),
      validateTeamPage(values),
      validateDetailsPage(values),
      getDocumentPageStatus(values.sciencePDF),
      submitStatuses.target,
      submitStatuses.observation,
      getDocumentPageStatus(values.technicalPDF),
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
