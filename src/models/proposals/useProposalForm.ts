import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProposalSchema, ProposalType } from './proposal';
import { getTitleValues } from './title';

type ProposalSeed = { id?: string | null; title?: string };

export function useProposalForm(proposal?: ProposalSeed) {
  const formMethods = useForm<ProposalType>({
    mode: 'all',
    resolver: zodResolver(getProposalSchema()),
    defaultValues: {
      title: getTitleValues(proposal)
    }
  });

  const { reset } = formMethods;
  const latestProposal = React.useRef(proposal);
  const proposalId = proposal?.id;

  React.useEffect(() => {
    latestProposal.current = proposal;
  });

  // Update the form whenever the proposal ID changes, ensuring the latest title is reflected.
  React.useEffect(() => {
    reset({ title: getTitleValues(latestProposal.current) });
  }, [proposalId, reset]);

  return formMethods;
}
