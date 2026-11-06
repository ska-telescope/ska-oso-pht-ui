import React from 'react';
import { useForm } from 'react-hook-form';
import { getProposalSchema, ProposalType, getProposalResolver } from './proposal';
import { getDetailsValues } from './details';
import { getTeamValues } from './team';
import Investigator from '@/utils/types/investigator';

type ProposalSeed = Omit<Partial<ProposalType>, 'scienceCategory' | 'investigators'> & {
  id?: string | null;
  scienceCategory?: number | string | null;
  investigators?: Investigator[] | null;
};

/** The form values of a new proposal: the schema's defaults. */
export const getProposalFormDefaults = (): ProposalType => getProposalSchema().parse({});

/**
 * Form values for every migrated slice, taken from the proposal or defaulted. The proposal's own
 * content is not validated here: Details categories are normalized and Team metadata is excluded.
 */
export const getProposalFormValues = (proposal?: ProposalSeed): ProposalType => {
  const defaults = getProposalFormDefaults();
  const slices = Object.fromEntries(
    (Object.keys(defaults) as (keyof ProposalType)[]).map((slice) => [
      slice,
      proposal?.[slice] ?? defaults[slice]
    ])
  ) as ProposalType;
  return {
    ...slices,
    ...getDetailsValues(proposal),
    ...getTeamValues(proposal)
  };
};

export function useProposalForm(proposal?: ProposalSeed) {
  const formMethods = useForm<ProposalType>({
    mode: 'all',
    resolver: getProposalResolver(),
    defaultValues: getProposalFormValues(proposal)
  });

  const { reset } = formMethods;
  const currentProposalRef = React.useRef(proposal);
  const proposalId = proposal?.id;
  const seededProposalIdRef = React.useRef(proposalId);

  React.useEffect(() => {
    currentProposalRef.current = proposal;
  });

  // Re-seed migrated fields when loading or switching proposals, not on store synchronization.
  React.useEffect(() => {
    if (proposalId === seededProposalIdRef.current) return;
    seededProposalIdRef.current = proposalId;
    reset(getProposalFormValues(currentProposalRef.current));
  }, [proposalId, reset]);

  return formMethods;
}
