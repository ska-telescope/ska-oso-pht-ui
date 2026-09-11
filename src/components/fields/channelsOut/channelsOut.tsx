import { Box } from '@mui/system';
import React from 'react';
import { z } from 'zod';
import { CHANNELS_OUT_MAX, CHANNELS_OUT_MIN } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface ChannelsOutFieldProps {
  disabled?: boolean;
  required?: boolean;
  maxValue?: number;
  onFocus?: () => void;
  setValue?: (value: number) => void;
  value: number;
}

export const channelsOutSchemaForMax = (maxValue: number) =>
  z.number().finite().int().min(CHANNELS_OUT_MIN).max(maxValue);

export const channelsOutSchema = channelsOutSchemaForMax(CHANNELS_OUT_MAX);

/**
 * Number of output channels selected, default is the max available.
 */
export default function ChannelsOutField({
  disabled = false,
  required = false,
  maxValue = CHANNELS_OUT_MAX,
  onFocus,
  setValue,
  value
}: ChannelsOutFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'channelsOut';
  const [errorText, setErrorText] = React.useState('');
  const rangeErrorMessage = t(FIELD + '.error', {
    min: CHANNELS_OUT_MIN,
    max: maxValue
  });

  const validateChannelsOut = (channels: number) =>
    channelsOutSchemaForMax(maxValue).safeParse(channels).success ? '' : rangeErrorMessage;

  const commit = (channels: number) => {
    setValue?.(channels);
    setErrorText(validateChannelsOut(channels));
  };

  const stepChannels = (channels: number, direction: 1 | -1) =>
    Math.min(
      maxValue,
      Math.max(
        CHANNELS_OUT_MIN,
        Number.isInteger(channels)
          ? channels + direction
          : direction === 1
            ? Math.ceil(channels)
            : Math.floor(channels)
      )
    );

  React.useEffect(() => {
    setErrorText(validateChannelsOut(value));
  }, [value]);

  return (
    <Box pt={1}>
      <SteppedNumberField
        testId={FIELD}
        value={value}
        onStep={stepChannels}
        onCommit={commit}
        label={t(FIELD + '.label')}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        min={CHANNELS_OUT_MIN}
        max={maxValue}
        errorText={errorText}
      />
    </Box>
  );
}
