import React from 'react';
import { useLocation } from 'react-router';
import { AUTO_SAVE_INTERVAL, NAV, PATH } from '@utils/constants.ts';
import { useSaveDraft } from './useSaveDraft';
import { useLastSaved } from './LastSavedContext';

type SaveDraft = ReturnType<typeof useSaveDraft>['saveDraft'];

/**
 * Saves the draft once AUTO_SAVE_INTERVAL seconds have passed without a save, while on a page that
 * offers saving. Any save (the Save button, leaving a page, or this timer) starts the wait again.
 */
function useSaveOnTimer(saveDraft: SaveDraft, onSavePage: boolean) {
  const { lastSave } = useLastSaved();

  // saveDraft is new on every render; the timer calls the latest without being restarted
  const saveDraftRef = React.useRef(saveDraft);
  React.useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  React.useEffect(() => {
    if (!onSavePage) {
      return;
    }
    const intervalId = setInterval(() => void saveDraftRef.current(), AUTO_SAVE_INTERVAL * 1000);
    return () => clearInterval(intervalId);
    // Every save is a new lastSave, which restarts the wait; it is otherwise unused here
  }, [onSavePage, lastSave]);
}

/** Saves the draft when leaving a page that offers saving for another proposal page or home. */
function useSaveOnNavigation(saveDraft: SaveDraft, onSavePage: boolean, pathname: string) {
  // The page being left, and whether it offered saving. saveDraft is new on every render, so this
  // effect runs on every render too, but it only saves when the page has changed
  const previousPathRef = React.useRef(pathname);
  const previousOnSavePageRef = React.useRef(onSavePage);

  React.useEffect(() => {
    const leftSavePage = previousPathRef.current !== pathname && previousOnSavePageRef.current;
    if (leftSavePage && (NAV.includes(pathname) || pathname === PATH[0])) {
      void saveDraft();
    }
    previousPathRef.current = pathname;
    previousOnSavePageRef.current = onSavePage;
  }, [pathname, onSavePage, saveDraft]);
}

/**
 * Saves the draft automatically: on a timer, and on navigating away from a page. It sits above the
 * routes, so it sees every page change, however it was made.
 */
export function AutoSaveService() {
  const { pathname } = useLocation();
  const { saveDraft, isSavePage } = useSaveDraft();
  // NAV holds the proposal pages' routes in page number order; any other route gives -1
  const onSavePage = isSavePage(NAV.indexOf(pathname));

  useSaveOnTimer(saveDraft, onSavePage);
  useSaveOnNavigation(saveDraft, onSavePage, pathname);

  return null;
}
