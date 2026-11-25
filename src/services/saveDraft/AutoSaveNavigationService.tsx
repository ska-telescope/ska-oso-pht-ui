import React from 'react';
import { useLocation } from 'react-router';
import { NAV, PATH } from '@utils/constants.ts';
import { useSaveDraft } from './useSaveDraft';

/**
 * Saves the draft when leaving a page that offers saving for another proposal page or home. It
 * sits above the routes, so it sees every page change, however it was made.
 */
export function AutoSaveNavigationService() {
  const { pathname } = useLocation();
  const { saveDraft, isSavePage } = useSaveDraft();
  // NAV holds the proposal pages' routes in page number order; any other route gives -1
  const onSavePage = isSavePage(NAV.indexOf(pathname));

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

  return null;
}
