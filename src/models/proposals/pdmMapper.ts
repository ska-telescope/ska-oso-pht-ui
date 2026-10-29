import { ProposalBackend } from '@utils/types/proposal.tsx';
import { getProposalTypeSchema, ProposalType } from './proposal';
import { titleFromPdm, titleToPdm } from './title';
import { documentsFromPdm, documentsToPdm } from './documents';

/** PDM (ODA) → RHF form values. Add migrated page as a slice here. */
export function mapPdmToForm(pdm?: Partial<ProposalBackend>): ProposalType {
  return {
    title: titleFromPdm(pdm?.proposal_info),
    proposalType:
      getProposalTypeSchema().optional().parse(pdm?.proposal_info?.proposal_type?.main_type) ??
      null,
    ...documentsFromPdm(pdm?.observation_info?.documents),
    // Upload status is UI state, not part of the PDM.
    scienceLoadStatus: null,
    technicalLoadStatus: null
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
      documents: documentsToPdm(form, base.observation_info?.documents)
    }
  };
}
