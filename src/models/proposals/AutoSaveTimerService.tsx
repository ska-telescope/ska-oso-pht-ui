import React from 'react';
import { useLocation } from 'react-router';
import { AUTO_SAVE_INTERVAL, NAV } from '@utils/constants.ts';
import { useSaveDraft } from './useSaveDraft';

/**
 * Saves the draft every AUTO_SAVE_INTERVAL seconds on the pages that offer saving. It sits above
 * the routes, so the timer keeps running across page changes.
 */
export function AutoSaveTimerService() {
  const { pathname } = useLocation();
  const { saveDraft, isSavePage } = useSaveDraft();
  // NAV holds the proposal pages' routes in page number order; any other route gives -1
  const enabled = isSavePage(NAV.indexOf(pathname));

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
  }, [enabled]);

  return null;
}
