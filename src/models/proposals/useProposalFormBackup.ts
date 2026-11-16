import React from 'react';
import { useWatch, UseFormReturn } from 'react-hook-form';
import { ProposalType } from './proposal';
import { loadProposalFormBackup, saveProposalFormBackup } from './proposalFormBackupStorage';

export function useProposalFormBackup(
  form: Pick<UseFormReturn<ProposalType>, 'control' | 'getValues' | 'reset'>,
  proposalId?: string
) {
  const { getValues, reset } = form;
  const watchedValues = useWatch({ control: form.control });
  const watchedSnapshot = JSON.stringify(watchedValues);
  const baselineRef = React.useRef<{ proposalId: string; snapshot: string } | null>(null);

  React.useEffect(() => {
    if (!proposalId) {
      baselineRef.current = null;
      return;
    }
    const serverValues = getValues();
    baselineRef.current = { proposalId, snapshot: JSON.stringify(serverValues) };
    const backup = loadProposalFormBackup(proposalId);
    if (backup) {
      reset({ ...serverValues, ...backup }, { keepDefaultValues: true });
    }
  }, [getValues, proposalId, reset]);

  React.useEffect(() => {
    const baseline = baselineRef.current;
    if (
      !proposalId ||
      !baseline ||
      baseline.proposalId !== proposalId ||
      baseline.snapshot === watchedSnapshot
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      saveProposalFormBackup(proposalId, getValues());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [getValues, proposalId, watchedSnapshot]);
}
