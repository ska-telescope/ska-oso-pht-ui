import React from 'react';
import { useForm } from 'react-hook-form';
import { getProposalSchema, ProposalType, getProposalResolver } from './proposal';
type ProposalSeed = Partial<ProposalType> & { id?: string | null };

/** The form values of a new proposal: the schema's defaults. */
export const getProposalFormDefaults = (): ProposalType => getProposalSchema().parse({});

/**
 * Form values for every migrated slice, taken from the proposal or defaulted. The proposal's own
 * values are not checked here: a loaded proposal can hold content the checks reject.
 */
export const getProposalFormValues = (proposal?: ProposalSeed): ProposalType => {
  const defaults = getProposalFormDefaults();
  return Object.fromEntries(
    (Object.keys(defaults) as (keyof ProposalType)[]).map((slice) => [
      slice,
      proposal?.[slice] ?? defaults[slice]
    ])
  ) as ProposalType;
};

export function useProposalForm(proposal?: ProposalSeed) {
  const formMethods = useForm<ProposalType>({
    mode: 'all',
    resolver: getProposalResolver(),
    defaultValues: getProposalFormValues(proposal)
  });

  const { reset } = formMethods;
  const latestProposal = React.useRef(proposal);
  const proposalId = proposal?.id;

  React.useEffect(() => {
    latestProposal.current = proposal;
  });

  // Re-seed migrated fields when loading or switching proposals, not on store synchronization.
  React.useEffect(() => {
    reset(getProposalFormValues(latestProposal.current));
  }, [proposalId, reset]);

  return formMethods;
}
