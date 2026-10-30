import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProposalSchema, ProposalType } from './proposal';
import { getTitleValues } from './title';
import { getTargetsValues } from './targets';
import { getTargetObservationValues } from './targetObservation';
import { getCalibrationStrategyValues } from './calibrationStrategy';

type ProposalSeed = {
  id?: string | null;
  title?: string;
  proposalType?: ProposalType['proposalType'];
  targets?: ProposalType['targets'];
  targetObservation?: ProposalType['targetObservation'];
  calibrationStrategy?: ProposalType['calibrationStrategy'];
};

/** Form values for every migrated slice, taken from the proposal or defaulted. */
export const getProposalFormValues = (proposal?: ProposalSeed): ProposalType => ({
  title: getTitleValues(proposal),
  // Controlled fields need null to clear a previous selection on reset.
  proposalType: proposal?.proposalType ?? null,
  targets: getTargetsValues(proposal),
  targetObservation: getTargetObservationValues(proposal),
  calibrationStrategy: getCalibrationStrategyValues(proposal)
});

export function useProposalForm(proposal?: ProposalSeed) {
  const formMethods = useForm<ProposalType>({
    mode: 'all',
    resolver: zodResolver(getProposalSchema()),
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
