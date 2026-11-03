import { ProposalBackend } from '@utils/types/proposal.tsx';
import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import { getProposalTypeSchema, ProposalType } from './proposal';
import { titleFromPdm, titleToPdm } from './title';
import { documentsFromPdm, documentsToPdm } from './documents';

/** PDM (ODA) → RHF form values. Add migrated page as a slice here. */
export function mapPdmToForm(pdm?: Partial<ProposalBackend>): ProposalType {
  const documents = documentsFromPdm(pdm?.observation_info?.documents);
  const loadStatus = (ref: typeof documents.sciencePDF) =>
    ref?.isUploadedPdf ? FileUploadStatus.OK : FileUploadStatus.INITIAL;
  return {
    title: titleFromPdm(pdm?.proposal_info),
    proposalType:
      getProposalTypeSchema().optional().parse(pdm?.proposal_info?.proposal_type?.main_type) ??
      null,
    ...documents,
    // An already uploaded PDF must load as OK, or the page resets it to empty.
    scienceLoadStatus: loadStatus(documents.sciencePDF),
    technicalLoadStatus: loadStatus(documents.technicalPDF)
  };
}

/**
 * RHF form values → PDM (ODA). `base` is the PDM for the rest of the proposal (fields not yet
 * migrated to the form); the form's slices are laid over it.
 */
export function mapFormToPdm(form: ProposalType, base: ProposalBackend): ProposalBackend {
  return {
    ...base,
    proposal_info: {
      ...base.proposal_info,
      ...titleToPdm(form.title),
      proposal_type: {
        ...base.proposal_info.proposal_type,
        main_type: getProposalTypeSchema().parse(form.proposalType)
      }
    },
    observation_info: {
      ...base.observation_info,
      documents: documentsToPdm(form)
    }
  };
}
