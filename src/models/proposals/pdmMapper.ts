import { ProposalBackend } from '@utils/types/proposal.tsx';
import { getProposalTypeSchema, ProposalType } from './proposal';
import { titleFromPdm, titleToPdm } from './title';
import { targetsFromPdm, targetsToPdm } from './targets';
import {
  observationTypesFromPdm,
  targetObservationFromPdm,
  targetObservationToPdm
} from './targetObservation';
import { calibrationStrategyFromPdm, calibrationStrategyToPdm } from './calibrationStrategy';

/** PDM (ODA) → RHF form values. Add migrated page as a slice here. */
export function mapPdmToForm(pdm?: Partial<ProposalBackend>): ProposalType {
  return {
    title: titleFromPdm(pdm?.proposal_info),
    proposalType:
      getProposalTypeSchema().optional().parse(pdm?.proposal_info?.proposal_type?.main_type) ??
      null,
    targets: targetsFromPdm(pdm?.observation_info?.targets),
    targetObservation: targetObservationFromPdm(
      pdm?.observation_info?.result_details,
      pdm?.observation_info?.observation_sets
    ),
    calibrationStrategy: calibrationStrategyFromPdm(pdm?.observation_info?.calibration_strategy)
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
      targets: targetsToPdm(form.targets),
      calibration_strategy: calibrationStrategyToPdm(form.calibrationStrategy),
      // Observations are not in the form yet, so their types come from the base PDM
      result_details: targetObservationToPdm(
        form.targetObservation,
        observationTypesFromPdm(base.observation_info?.observation_sets)
      )
    }
  };
}
