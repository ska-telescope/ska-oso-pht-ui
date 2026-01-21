import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { getScaledBandwidthOrFrequency } from '@/utils/helpers';

interface SubBandsProps {
  disabled?: boolean;
  setValue: Function;
  value: number;
  suffix?: any;
  isMid: boolean;
  isContinuum: boolean;
  continuumBandwidth: number;
  continuumBandwidthUnits: number;
  minimumChannelWidthHz: number;
}

export default function SubBands({
  disabled = false,
  setValue,
  value,
  suffix,
  isMid,
  isContinuum,
  continuumBandwidth,
  continuumBandwidthUnits,
  minimumChannelWidthHz
}: SubBandsProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'subBands';

  const [errorText, setErrorText] = React.useState('');

  React.useEffect(() => {
    if (errorText) {
      const timer = setTimeout(() => {
        setErrorText('');
      }, ERROR_SECS);
      return () => clearTimeout(timer);
    }
  }, [errorText]);

  const computeErrorMessage = (val: number) => {
    const min = Number(t(FIELD + '.range.lower'));
    const max = Number(t(FIELD + '.range.upper'));
    if (val < min || val > max) {
      return t(FIELD + '.range.error');
    }
    if (isMid && isContinuum) {
      const scaledBandwidth = getScaledBandwidthOrFrequency(
        continuumBandwidth,
        continuumBandwidthUnits
      );
      if (scaledBandwidth !== 0 && val && scaledBandwidth / val < minimumChannelWidthHz) {
        return t('subBands.range.bandwidthSubBand');
      }
    }
    return '';
  };

  const validate = (e: number) => {
    const newVal = Number(Math.abs(e).toFixed(0));
    const msg = computeErrorMessage(newVal);
    setErrorText(msg);
    if (msg.length === 0) {
      setValue(newVal);
    }
  };

  return (
    <Box pt={1}>
      <NumberEntry
        disabled={disabled}
        label={t(FIELD + '.label')}
        suffix={suffix}
        testId={FIELD}
        value={value}
        setValue={validate}
        onFocus={() => setHelp(FIELD)}
        required
        errorText={errorText}
      />
    </Box>
  );
}
