import { Box } from '@mui/system';
import { CHANNELS_OUT_MAX, CHANNELS_OUT_MIN } from '@utils/constants.ts';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface ChannelsOutFieldProps {
  disabled?: boolean;
  required?: boolean;
  maxValue?: number;
  onFocus?: () => void;
  setValue?: Function;
  suffix?: JSX.Element;
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

  const commit = (num: number) => {
    setValue?.(num);
    setErrorMessage(validate(num));
  };

  const step = (current: number, direction: 1 | -1) =>
    Math.min(Math.max(current + direction, CHANNELS_OUT_MIN), maxValue);

  React.useEffect(() => {
    setErrorMessage(validate(value));
  }, [value, maxValue]);

  return (
    <Box pt={1}>
      <SteppedNumberField
        testId={FIELD}
        label={t('channelsOut.label')}
        value={value}
        digitsOnly
        onCommit={commit}
        onStep={step}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        errorText={errorMessage}
        suffix={suffix}
        min={CHANNELS_OUT_MIN}
        max={maxValue}
        step={1}
      />
    </Box>
  );
}
