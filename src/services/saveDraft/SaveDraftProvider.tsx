import React from 'react';
import { AutoSaveNavigationService } from './AutoSaveNavigationService';
import { AutoSaveTimerService } from './AutoSaveTimerService';
import { LastSavedProvider } from './LastSavedContext';

/**
 * Draft saving for the pages below it: saves on a timer and on leaving a page, and keeps when the
 * proposal was last saved. It must sit inside the proposal FormProvider, as saving reads the form.
 */
export function SaveDraftProvider({ children }: { children: React.ReactNode }) {
  return (
    <LastSavedProvider>
      <AutoSaveTimerService />
      <AutoSaveNavigationService />
      {children}
    </LastSavedProvider>
  );
}
