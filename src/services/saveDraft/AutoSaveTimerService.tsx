import React from 'react';
import { useLocation } from 'react-router';
import { AUTO_SAVE_INTERVAL, NAV } from '@utils/constants.ts';
import { useSaveDraft } from './useSaveDraft';
import { useLastSaved } from './LastSavedContext';

/**
 * Saves the draft once AUTO_SAVE_INTERVAL seconds have passed without a save, on the pages that
 * offer saving. Any save (the Save button, leaving a page, or this timer) starts the wait again.
 */
export function AutoSaveTimerService() {
  const { pathname } = useLocation();
  const { saveDraft, isSavePage } = useSaveDraft();
  // NAV holds the proposal pages' routes in page number order; any other route gives -1
  const enabled = isSavePage(NAV.indexOf(pathname));
  const { lastSave } = useLastSaved();

  // saveDraft is new on every render; the timer calls the latest without being restarted
  const saveDraftRef = React.useRef(saveDraft);
  React.useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    const intervalId = setInterval(() => void saveDraftRef.current(), AUTO_SAVE_INTERVAL * 1000);
    return () => clearInterval(intervalId);
    // Every save is a new lastSave, which restarts the wait; it is otherwise unused here
  }, [enabled, lastSave]);

  return null;
}
