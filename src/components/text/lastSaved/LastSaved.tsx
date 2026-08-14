import { Typography } from '@mui/material';
import { presentDate, presentTime } from '@/utils/present/present';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface LastSavedProps {
  lastUpdated?: string;
}

export default function LastSaved({ lastUpdated }: LastSavedProps) {
  const { t } = useScopedTranslation();

  // presentDate returns '' for anything it cannot parse, which covers both a
  // missing and a malformed timestamp. Without this guard an unparseable value
  // would fall through to the date-and-time branch and render "Last saved:  ".
  const date = presentDate(lastUpdated ?? '');
  if (!date) {
    return null;
  }

  const stamp = lastUpdated as string;
  const isToday = date === presentDate(new Date().toISOString());
  const value = isToday ? presentTime(stamp) : `${date} ${presentTime(stamp)}`;

  return (
    <Typography variant="caption" data-testid="lastSavedTestId">
      {t('saveBtn.lastSaved', { value })}
    </Typography>
  );
}
