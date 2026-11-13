import { ProposalBackend } from '@utils/types/proposal.tsx';
import { getProposalTypeSchema, ProposalType } from './proposal';
import { titleFromPdm, titleToPdm } from './title';
import { detailsFromPdm, detailsToPdm } from './details';
import { teamFromPdm, teamToPdm } from './team';
import { targetsFromPdm, targetsToPdm } from './targets';
import { targetObservationFromPdm, targetObservationToPdm } from './targetObservation';
import { calibrationStrategyFromPdm, calibrationStrategyToPdm } from './calibrationStrategy';
import { documentsFromPdm, documentsToPdm } from './documents';
import { dataProductsFromPdm, dataProductsToPdm, getDataProductSchema } from './dataProducts';

/** PDM (ODA) → RHF form values. Add migrated page as a slice here. */
export function mapPdmToForm(pdm?: Partial<ProposalBackend>): ProposalType {
  const documents = documentsFromPdm(pdm?.observation_info?.documents);
  return {
    title: titleFromPdm(pdm?.proposal_info),
    proposalType:
      getProposalTypeSchema().optional().parse(pdm?.proposal_info?.proposal_type?.main_type) ??
      null,
    ...detailsFromPdm(pdm?.proposal_info),
    ...teamFromPdm(pdm?.proposal_info?.investigators),
    targets: targetsFromPdm(pdm?.observation_info?.targets),
    targetObservation: targetObservationFromPdm(
      pdm?.observation_info?.result_details,
      pdm?.observation_info?.observation_sets
    ),
    calibrationStrategy: calibrationStrategyFromPdm(pdm?.observation_info?.calibration_strategy),
    ...documents,
    dataProducts: dataProductsFromPdm(pdm?.observation_info?.data_product_sdps)
  };
}

/**
 * RHF form values → PDM (ODA). `base` is the PDM for the rest of the proposal (fields not yet
 * migrated to the form); the form's slices are laid over it.
 */
export function mapFormToPdm(form: ProposalType, base: ProposalBackend): ProposalBackend {
  // Only valid data products and links with a valid data product are saved
  const dataProducts = form.dataProducts.flatMap((dp) => {
    const parsed = getDataProductSchema().safeParse(dp);
    return parsed.success ? [parsed.data] : [];
  });
  const savedIds = new Set(dataProducts.map((dp) => dp.id));
  const links = form.targetObservation.filter((link) => savedIds.has(link.dataProductsSDPId));

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
    investigator_refs: (form.investigators ?? []).map(({ id }) => id),
    observation_info: {
      ...base.observation_info,
      targets: targetsToPdm(form.targets),
      calibration_strategy: calibrationStrategyToPdm(form.calibrationStrategy),
      result_details: targetObservationToPdm(links),
      data_product_sdps: dataProductsToPdm(dataProducts),
      documents: documentsToPdm(form)
    }
  };
}
