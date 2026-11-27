import {
  DETAILS,
  ProposalTypeType,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_ZOOM,
  TYPE_ZOOM_LONG
} from '@utils/constants.ts';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import Investigator from '@utils/types/investigator.tsx';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { investigatorsFromPdm } from './team';

/**
 * A proposal as the lists show it (the landing page, and the PMT's proposal grids and review
 * lists), with only the fields they display or filter on. The proposal being edited is the form's
 * ProposalType instead.
 */
export interface ProposalSummary {
  id: string;
  title: string;
  status: string;
  cycle: string | null;
  lastUpdated: string;
  proposalType?: ProposalTypeType;
  /** The science category's value, as a string, or '' when the proposal has none (e.g. SV) */
  scienceCategory: string;
  /** The first observation's type, from which the observing mode is shown, or null if none */
  observingType: string | null;
  investigators: Investigator[];
}

// The science category is stored by its label; the lists compare and translate it by its value
const scienceCategoryFromPdm = (label: string | null | undefined): string => {
  const category = DETAILS.ScienceCategory.find(
    (c) => c.label?.toLowerCase() === label?.toLowerCase()
  )?.value;
  return category ? String(category) : '';
};

// The PDM spells out the zoom and spectral continuum types; the app uses their short forms
const observingTypeFromPdm = (type: string | undefined): string | null => {
  if (!type) return null;
  if (type === TYPE_ZOOM_LONG) return String(TYPE_ZOOM);
  if (type === TYPE_CONTINUUM_SPECTRAL_LONG) return String(TYPE_CONTINUUM_SPECTRAL);
  return type;
};

export const proposalSummaryFromPdm = (pdm: ProposalPDM): ProposalSummary => ({
  id: String(pdm.prsl_id),
  title: pdm.proposal_info?.title,
  status: pdm.status as string,
  cycle: pdm.cycle,
  lastUpdated: pdm.metadata?.last_modified_on as string,
  proposalType: pdm.proposal_info?.proposal_type?.main_type as ProposalTypeType,
  scienceCategory: scienceCategoryFromPdm(pdm.proposal_info?.science_category),
  observingType: observingTypeFromPdm(
    pdm.observation_info?.observation_sets?.[0]?.observation_type_details?.observation_type
  ),
  // The lists show who is on the team, not whether they have accepted
  investigators: investigatorsFromPdm(pdm.proposal_info?.investigators).map((investigator) => ({
    ...investigator,
    status: 'unknown'
  }))
});

/**
 * Maps the proposals the ODA returns for a list. The ODA can return several versions of a
 * proposal, so only the most recent of each is kept, most recently updated first.
 */
export const proposalSummariesFromPdm = (pdms: ProposalPDM[]): ProposalSummary[] =>
  (pdms.length > 1 ? getUniqueMostRecentItems(pdms, 'prsl_id') : pdms).map(proposalSummaryFromPdm);
