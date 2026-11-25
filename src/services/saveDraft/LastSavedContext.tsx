import React, { createContext, use, useCallback, useMemo, useState } from 'react';
import { Proposal } from '@utils/types/proposal.tsx';

type LastSave = { proposalId: string; savedOn: string };

type LastSavedContextValue = {
  /** When the proposal was last saved: its latest save this session, else when it was loaded */
  lastSavedOn: (proposal: Proposal) => string | undefined;
  recordSave: (proposalId: string, savedOn: string) => void;
};

// Without a provider nothing is remembered: saves are not recorded and the loaded time is given
const LastSavedContext = createContext<LastSavedContextValue>({
  lastSavedOn: (proposal) => proposal.lastUpdated,
  recordSave: () => {}
});

/** Holds when the proposal was last saved, for every save and every page below it. */
export const LastSavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastSave, setLastSave] = useState<LastSave | null>(null);

  const recordSave = useCallback(
    (proposalId: string, savedOn: string) => setLastSave({ proposalId, savedOn }),
    []
  );

  // A save of another proposal says nothing about this one, so fall back to its loaded time
  const lastSavedOn = useCallback(
    (proposal: Proposal) =>
      lastSave && lastSave.proposalId === proposal.id ? lastSave.savedOn : proposal.lastUpdated,
    [lastSave]
  );

  const value = useMemo(() => ({ lastSavedOn, recordSave }), [lastSavedOn, recordSave]);
  return <LastSavedContext value={value}>{children}</LastSavedContext>;
};

export const useLastSaved = () => use(LastSavedContext);
