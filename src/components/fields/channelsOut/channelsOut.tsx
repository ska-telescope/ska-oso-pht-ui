import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { CHANNELS_OUT_MAX, CHANNELS_OUT_MIN } from '@utils/constants.ts';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ChannelsOutFieldProps {
  disabled?: boolean;
  required?: boolean;
  maxValue?: number;
  onFocus?: Function;
  setValue?: Function;
  suffix?: any;
  value: number;
}

/**
 * Number of output channels selected, default is the max available.
 */
export default function ChannelsOutField({
  disabled = false,
  required = false,
  maxValue = CHANNELS_OUT_MAX,
  onFocus,
  setValue,
  suffix,
  value
}: ChannelsOutFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'channelsOut';

  const validate = (num: number): string =>
    Number.isInteger(num) && num >= CHANNELS_OUT_MIN && num <= maxValue
      ? ''
      : t(FIELD + '.error', { min: CHANNELS_OUT_MIN, max: maxValue });

  const [errorMessage, setErrorMessage] = React.useState(() => validate(value));

  const commit = (e: number) => {
    const num = Number(e);
    if (setValue) {
      setValue(num);
    }
    setErrorMessage(validate(num));
  };

  React.useEffect(() => {
    setErrorMessage(validate(value));
  }, [value, maxValue]);

  return (
    <Box pt={1}>
      <NumberEntry
        label={t('channelsOut.label')}
        testId={FIELD}
        value={value}
        setValue={commit}
        onFocus={onFocus}
        disabled={disabled}
        disabledUnderline={disabled}
        required={required}
        suffix={suffix}
        errorText={errorMessage}
      />
    </Box>
  );
}
