import { ProposalBackend } from '@utils/types/proposal.tsx';
import { getProposalTypeSchema, ProposalType } from './proposal';
import { titleFromPdm, titleToPdm } from './title';
import { detailsFromPdm, detailsToPdm } from './details';
import Proposal from '@utils/types/proposal.tsx';
import { teamFromProposal, teamToPdm } from './team';
import { getInvestigators } from '@services/axios/get/getProposal/getProposal';

/** PDM (ODA) → RHF form values. Add migrated page as a slice here. */
export function mapPdmToForm(
  pdm?: Partial<ProposalBackend>,
  proposal?: Pick<Proposal, 'observations' | 'investigators'>
): ProposalType {
  return {
    title: titleFromPdm(pdm?.proposal_info),
    proposalType:
      getProposalTypeSchema().optional().parse(pdm?.proposal_info?.proposal_type?.main_type) ??
      null,
    ...detailsFromPdm(pdm?.proposal_info, proposal?.observations?.[0]?.type ?? null),
    ...teamFromProposal({
      investigators: proposal?.investigators ?? getInvestigators(pdm?.proposal_info?.investigators)
    })
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
      ...detailsToPdm(form),
      investigators: teamToPdm(form.investigators ?? []),
      proposal_type: {
        ...base.proposal_info.proposal_type,
        main_type: getProposalTypeSchema().parse(form.proposalType)
      }
    },
    investigator_refs: (form.investigators ?? []).map(({ id }) => id)
  };
}
