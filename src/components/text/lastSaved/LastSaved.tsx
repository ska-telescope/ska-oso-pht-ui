import React from 'react';
import { Typography } from '@mui/material';
import { parseDate, presentDate, presentTime } from '@/utils/present/present';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface LastSavedProps {
  lastUpdated?: string;
}

export default function LastSaved({ lastUpdated }: LastSavedProps) {
  const { t } = useScopedTranslation();

  // presentDate/presentTime each build a fresh Intl formatter, and this sits in
  // the banner - which re-renders on every keystroke in title or abstract.
  const value = React.useMemo(() => {
    if (!lastUpdated) {
      return '';
    }
    const saved = parseDate(lastUpdated);
    if (!saved) {
      return '';
    }
    const today = new Date();
    const isToday =
      saved.getFullYear() === today.getFullYear() &&
      saved.getMonth() === today.getMonth() &&
      saved.getDate() === today.getDate();

    const time = presentTime(lastUpdated);
    return isToday ? time : `${presentDate(lastUpdated)} ${time}`;
  }, [lastUpdated]);

  // Nothing to show for a missing or unparseable timestamp.
  if (!value) {
    return null;
  }

  return (
    <Typography variant="caption" data-testid="lastSavedTestId">
      {t('saveBtn.lastSaved', { value })}
    </Typography>
  );
}
