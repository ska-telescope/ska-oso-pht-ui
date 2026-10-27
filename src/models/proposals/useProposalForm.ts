import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProposalSchema, ProposalType } from './proposal';
import { getTitleValues } from './title';

type ProposalSeed = {
  id?: string | null;
  title?: string;
  proposalType?: ProposalType['proposalType'];
};

export function useProposalForm(proposal?: ProposalSeed) {
  const formMethods = useForm<ProposalType>({
    mode: 'all',
    resolver: zodResolver(getProposalSchema()),
    defaultValues: {
      title: getTitleValues(proposal),
      // Controlled fields need null to clear a previous selection on reset.
      proposalType: proposal?.proposalType ?? null
    }
  });

  const { reset } = formMethods;
  const latestProposal = React.useRef(proposal);
  const proposalId = proposal?.id;

  React.useEffect(() => {
    latestProposal.current = proposal;
  });

  // Re-seed migrated fields when loading or switching proposals, not on store synchronization.
  React.useEffect(() => {
    reset({
      title: getTitleValues(latestProposal.current),
      proposalType: latestProposal.current?.proposalType ?? null
    });
  }, [proposalId, reset]);

  return formMethods;
}
