import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_POSITION } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface TimeAveragingFieldProps {
  disabled?: boolean;
  required?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  suffix?: any;
  value: number;
}

export default function TimeAveragingField({
  disabled = false,
  required = false,
  labelWidth = 5,
  onFocus,
  setValue,
  suffix,
  value
}: TimeAveragingFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'timeAveraging';

  const errorText = () => (Number(value) ? '' : t('timeAveraging.error'));
  const setTheNumber = (inNum: number) => {
    const str = Math.abs(inNum).toString();
    const num = Number(str);
    if (setValue) {
      setValue(num);
    }
  };

  return (
    <Box pt={1}>
      <NumberEntry
        label={t('timeAveraging.label')}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        testId={FIELD}
        value={value}
        setValue={(e: number) => setTheNumber(e)}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        suffix={suffix}
        errorText={errorText()}
      />
    </Box>
  );
}
