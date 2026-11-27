import { getSubmitPageStatuses } from '@/models/proposals/submit';
import type { ProposalType } from '@/models/proposals/proposal';
import { PROPOSAL_TYPE, STATUS_ERROR, STATUS_OK } from './../constants';
import { useOSDAccessors } from '../osd/useOSDAccessors/useOSDAccessors';
import { getTitleSchema } from '../../models/proposals/title';
import { getDetailsSchema } from '@/models/proposals/details';
import { getDocumentPageStatus } from '@/models/proposals/documents';

// Each page is complete or not: the title needs a valid title and a proposal type
export const validateTitlePage = (values: Pick<ProposalType, 'title' | 'proposalType'>) =>
  getTitleSchema().safeParse(values.title).success && values.proposalType.type !== null
    ? STATUS_OK
    : STATUS_ERROR;

export const validateTeamPage = (values: Pick<ProposalType, 'investigators'>) =>
  values.investigators.length > 0 ? STATUS_OK : STATUS_ERROR;

export const validateDetailsPage = (
  values: Pick<ProposalType, 'abstract' | 'scienceCategory' | 'proposalType' | 'observations'>
) => {
  const hasCategoryOrMode =
    values.proposalType.type === PROPOSAL_TYPE.SCIENCE_VERIFICATION
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
