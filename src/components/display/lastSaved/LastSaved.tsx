import { Box, Typography } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import { Proposal } from '@utils/types/proposal.tsx';
import { presentDate, presentTime } from '@/utils/present/present';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useLastSaved } from '@/services/saveDraft/LastSavedContext';

/** When the proposal was last saved: the time for a save today, else the date and time. */
export default function LastSaved() {
  const { t } = useScopedTranslation();
  const { application } = storageObject.useStore();
  const { lastSavedOn } = useLastSaved();
  const savedOn = lastSavedOn(application.content2 as Proposal);

  // Nothing to show for a missing or unreadable time
  const time = savedOn ? presentTime(savedOn) : '';
  if (!savedOn || !time) {
    return null;
  }
  const date = presentDate(savedOn);
  const value = date === presentDate(new Date().toISOString()) ? time : `${date} ${time}`;

  // "Last saved:" above the time, centred on each other and closely spaced
  return (
    <Box
      data-testid="lastSaved"
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}
    >
      <Typography variant="caption" sx={{ lineHeight: 'inherit' }}>
        {t('saveBtn.lastSaved')}
      </Typography>
      <Typography variant="caption" sx={{ lineHeight: 'inherit' }}>
        {value}
      </Typography>
    </Box>
  );
}
