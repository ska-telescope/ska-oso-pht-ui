import { z } from 'zod';
import { PROPOSAL_TYPE } from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { getProposalSubTypesSchema, getProposalTypeSchema, ProposalType } from './proposal';
import { titleFromPdm, titleToPdm } from './title';
import { detailsFromPdm, detailsToPdm } from './details';
import { teamFromPdm, teamToPdm } from './team';
import { targetsFromPdm, targetsToPdm } from './targets';
import { targetObservationFromPdm, targetObservationToPdm } from './targetObservation';
import { calibrationStrategyFromPdm, calibrationStrategyToPdm } from './calibrationStrategy';
import { documentsFromPdm, documentsToPdm } from './documents';
import { dataProductsFromPdm } from './dataProducts';
import { observationInfoToSave } from './save';
import { observationsFromPdm } from './observations';

/**
 * PDM (ODA) → RHF form values. Add migrated page as a slice here. What the PDM requires is read
 * as it is, so a proposal without it fails to load; what the PDM makes optional gets the form's
 * default.
 */
export function mapPdmToForm(pdm: ProposalBackend): ProposalType {
  const { proposal_info: proposalInfo, observation_info: observationInfo } = pdm;
  return {
    prslId: z.string().parse(pdm.prsl_id),
    cycle: pdm.cycle,
    title: titleFromPdm(proposalInfo),
    proposalType: {
      type: getProposalTypeSchema().parse(proposalInfo.proposal_type.main_type),
      subTypes: getProposalSubTypesSchema().parse(proposalInfo.proposal_type.attributes ?? [])
    },
    ...detailsFromPdm(proposalInfo),
    ...teamFromPdm(proposalInfo.investigators),
    targets: targetsFromPdm(observationInfo.targets),
    targetObservation: targetObservationFromPdm(
      observationInfo.result_details,
      observationInfo.observation_sets
    ),
    calibrationStrategy: calibrationStrategyFromPdm(observationInfo.calibration_strategy),
    ...documentsFromPdm(observationInfo.documents),
    dataProducts: dataProductsFromPdm(observationInfo.data_product_sdps),
    observations: observationsFromPdm(observationInfo.observation_sets)
  };
}

/**
 * RHF form values → PDM (ODA). `base` is the PDM for the rest of the proposal (fields not yet
 * migrated to the form); the form's slices are laid over it.
 */
export function mapFormToPdm(form: ProposalType, base: ProposalBackend): ProposalBackend {
  const saved = observationInfoToSave({
    isSV: form.proposalType.type === PROPOSAL_TYPE.SCIENCE_VERIFICATION,
    observations: form.observations,
    dataProducts: form.dataProducts,
    links: form.targetObservation,
    calibrationStrategy: form.calibrationStrategy
  });

  return {
    ...base,
    prsl_id: form.prslId,
    cycle: form.cycle,
    proposal_info: {
      ...base.proposal_info,
      ...titleToPdm(form.title),
      ...detailsToPdm(form),
      investigators: teamToPdm(form.investigators ?? []),
      proposal_type: {
        main_type: getProposalTypeSchema().parse(form.proposalType.type),
        attributes: form.proposalType.subTypes
      }
    },
    investigator_refs: (form.investigators ?? []).map(({ id }) => id),
    observation_info: {
      ...base.observation_info,
      targets: targetsToPdm(form.targets),
      observation_sets: saved.observationSets,
      calibration_strategy: calibrationStrategyToPdm(saved.calibrationStrategy),
      result_details: targetObservationToPdm(saved.links),
      data_product_sdps: saved.dataProducts,
      documents: documentsToPdm(form)
    }
  };
}
