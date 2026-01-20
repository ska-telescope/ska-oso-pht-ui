import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { LAB_POS_TICK } from '@utils/constants.ts';
import { TickBox } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ContinuumSubtractionFieldProps {
  disabled?: boolean;
  observationType?: string;
  dataProductType?: number;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  setValue?: (value: boolean) => void;
  value: boolean;
  displayOnly?: boolean;
}

const TICK_LABEL_WIDTH = 10;

export default function ContinuumSubtractionField({
  disabled = false,
  onFocus,
  setValue,
  value,
  displayOnly = false
}: ContinuumSubtractionFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'continuumSubtraction';

  return (
    <Box pt={2}>
      {displayOnly ? (
        <Typography variant="subtitle1" color={disabled ? 'text.disabled' : 'text.primary'}>
          {t(`${FIELD}.label`)}: {t(value ? 'yes' : 'no')}
        </Typography>
      ) : (
        <TickBox
          disabled={disabled}
          label={t(`${FIELD}.label`)}
          labelBold
          labelPosition={LAB_POS_TICK}
          labelWidth={TICK_LABEL_WIDTH}
          testId={FIELD}
          checked={value}
          onChange={(event: { target: { checked: boolean } }) => setValue?.(event.target.checked)}
          onFocus={onFocus}
        />
      )}
    </Box>
  );
}
