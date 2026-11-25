import React from 'react';
import { useForm } from 'react-hook-form';
import { ProposalType, getProposalResolver } from './proposal';
import { getDetailsValues } from './details';
import { getTeamValues } from './team';
import Investigator from '@/utils/types/investigator';
import Observation from '@/utils/types/observation';
import GroupObservation from '@/utils/types/groupObservation';
import { formObservationsFromLegacy } from './legacyObservations';
import { ObservationOsd } from './observations';
import type { ProposalSubTypeType, ProposalTypeType } from '@/utils/constants';

// TODO(T9): The legacy proposal shape, which tests and a new proposal still seed the form from
export type ProposalSeed = Omit<
  Partial<ProposalType>,
  'prslId' | 'cycle' | 'proposalType' | 'scienceCategory' | 'investigators' | 'observations'
> & {
  id?: string | null;
  cycle?: string | null;
  // TODO: The legacy store's shape, until nothing reads them from there
  proposalType?: ProposalTypeType | null;
  proposalSubType?: ProposalSubTypeType[] | null;
  scienceCategory?: number | string | null;
  investigators?: Investigator[] | null;
  // The legacy store's shape, until nothing reads observations from there
  observations?: Observation[] | null;
  groupObservations?: GroupObservation[] | null;
};

/** The form values of a new proposal. */
export const getProposalFormDefaults = (): ProposalType => ({
  // No proposal is open
  prslId: '',
  cycle: '',
  title: '',
  proposalType: { type: null, subTypes: [] },
  abstract: '',
  scienceCategory: null,
  investigators: [],
  targets: [],
  targetObservation: [],
  calibrationStrategy: [],
  sciencePDF: null,
  technicalPDF: null,
  dataProducts: [],
  observations: []
});

/**
 * Form values for every migrated slice, taken from the proposal or defaulted. The proposal's own
 * content is not validated here: Details categories are normalized and Team metadata is excluded.
 */
export const getProposalFormValues = (proposal?: ProposalSeed): ProposalType => {
  const defaults = getProposalFormDefaults();
  const slices = Object.fromEntries(
    (Object.keys(defaults) as (keyof ProposalType)[])
      // The seed has the ID as id, so it is set below
      .filter((slice): slice is Exclude<keyof ProposalType, 'prslId'> => slice !== 'prslId')
      .map((slice) => [slice, proposal?.[slice] ?? defaults[slice]])
  ) as ProposalType;
  return {
    ...slices,
    // The legacy store's names, until nothing reads them from there
    prslId: proposal?.id ?? '',
    cycle: proposal?.cycle ?? '',
    proposalType: {
      type: proposal?.proposalType ?? null,
      subTypes: proposal?.proposalSubType ?? []
    },
    ...getDetailsValues(proposal),
    ...getTeamValues(proposal),
    observations: formObservationsFromLegacy(proposal?.observations, proposal?.groupObservations)
  };
};

/**
 * The global proposal form. It starts empty: a proposal is opened by resetting the form (load,
 * create, clone or a new proposal) and closed by resetting it to getProposalFormDefaults().
 * Tests may pass initial values.
 */
export function useProposalForm(
  osd: ObservationOsd = {},
  initialValues: ProposalType = getProposalFormDefaults()
) {
  // The OSD loads after the form is created. The form takes the resolver it is given on each
  // render, so this one is rebuilt when the OSD changes.
  const resolver = React.useMemo(
    () => getProposalResolver({ low: osd.low, mid: osd.mid }),
    [osd.low, osd.mid]
  );
  return useForm<ProposalType>({
    mode: 'all',
    resolver,
    defaultValues: initialValues
  });
}
