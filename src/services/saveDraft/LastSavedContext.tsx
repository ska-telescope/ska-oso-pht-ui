import React, { createContext, use, useCallback, useMemo, useState } from 'react';
import { Proposal } from '@utils/types/proposal.tsx';

type LastSave = { proposalId: string; savedOn: string };

// The later of two times; a missing or unreadable one loses to the other
const later = (a?: string, b?: string) => {
  const aTime = a ? Date.parse(a) : NaN;
  const bTime = b ? Date.parse(b) : NaN;
  if (isNaN(aTime)) return b;
  if (isNaN(bTime)) return a;
  return aTime >= bTime ? a : b;
};

type LastSavedContextValue = {
  /** The latest save this session, of any proposal; a new object for every save */
  lastSave: LastSave | null;
  /** When the proposal was last saved: its save this session or the time it was loaded with,
   * whichever is later (someone else may have saved it since) */
  lastSavedOn: (proposal: Proposal) => string | undefined;
  recordSave: (proposalId: string, savedOn: string) => void;
};

// Without a provider nothing is remembered: saves are not recorded and the loaded time is given
const LastSavedContext = createContext<LastSavedContextValue>({
  lastSave: null,
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

  // A save of another proposal says nothing about this one
  const lastSavedOn = useCallback(
    (proposal: Proposal) =>
      later(
        lastSave?.proposalId === proposal.id ? lastSave.savedOn : undefined,
        proposal.lastUpdated
      ),
    [lastSave]
  );

  const value = useMemo(
    () => ({ lastSave, lastSavedOn, recordSave }),
    [lastSave, lastSavedOn, recordSave]
  );
  return <LastSavedContext value={value}>{children}</LastSavedContext>;
};

export const useLastSaved = () => use(LastSavedContext);
