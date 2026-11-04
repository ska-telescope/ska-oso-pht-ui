import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProposalSchema, ProposalType } from './proposal';
import { getTitleValues } from './title';
import { getDetailsValues } from './details';
import { getTeamValues } from './team';
import Investigator from '@/utils/types/investigator';

type ProposalSeed = {
  id?: string | null;
  title?: string;
  proposalType?: ProposalType['proposalType'];
  abstract?: string;
  scienceCategory?: number | string | null;
  observations?: { type?: string }[];
  investigators?: Investigator[] | null;
};

export function useProposalForm(proposal?: ProposalSeed) {
  const formMethods = useForm<ProposalType>({
    mode: 'all',
    resolver: zodResolver(getProposalSchema()),
    defaultValues: {
      title: getTitleValues(proposal),
      // Controlled fields need null to clear a previous selection on reset.
      proposalType: proposal?.proposalType ?? null,
      ...getDetailsValues(proposal),
      ...getTeamValues(proposal)
    }
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
    reset({
      title: getTitleValues(currentProposalRef.current),
      proposalType: currentProposalRef.current?.proposalType ?? null,
      ...getDetailsValues(currentProposalRef.current),
      ...getTeamValues(currentProposalRef.current)
    });
  }, [proposalId, reset]);

  return formMethods;
}
