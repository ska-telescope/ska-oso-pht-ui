import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import {
  BAND_LOW_STR,
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  TELESCOPE_LOW_NUM
} from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { frequencyConversion } from '@/utils/helpers';
import { InputAdornment, TextField } from '@mui/material';

interface CentralFrequencyProps {
  disabled?: boolean;
  observingBand: string;
  setValue: Function;
  suffix?: any;
  value: number;
}

export default function CentralFrequency({
  disabled = false,
  observingBand,
  setValue,
  suffix,
  value
}: CentralFrequencyProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'centralFrequency';
  const [errorMessage, setErrorMessage] = React.useState('');
  const { findBand, telescopeBand, osdLOW } = useOSDAccessors();
  const band = findBand(observingBand);
  const isLow = observingBand === BAND_LOW_STR;
  const units: number = telescopeBand(observingBand) === TELESCOPE_LOW_NUM ? FREQUENCY_MHZ : FREQUENCY_GHZ;
  const minFreq = frequencyConversion(band?.minFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const maxFreq = frequencyConversion(band?.maxFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const stepMHz = frequencyConversion(
    (osdLOW?.basicCapabilities.coarseChannelWidthHz ?? 1) * 2,
    FREQUENCY_HZ,
    FREQUENCY_MHZ
  );

  const validate = (cfValue: number): string => {
    const lowStationChannelWidthMHz = frequencyConversion(osdLOW?.basicCapabilities.coarseChannelWidthHz, FREQUENCY_HZ, FREQUENCY_MHZ);
    if (cfValue < minFreq || cfValue > maxFreq) return t(FIELD + '.error.range');
    if (isLow && Number.isInteger(cfValue + 0.5 * lowStationChannelWidthMHz / lowStationChannelWidthMHz)) {
      return t(FIELD + '.error.divisibility', { value: stepMHz });
    }
    return '';
  };

  const checkValue = (cfValue: number) => {
    if (isLow && Math.abs(Math.abs(cfValue - value) - stepMHz) < 1e-6) {
      const snapped = cfValue > value
        ? minFreq + Math.ceil((cfValue - minFreq) / stepMHz) * stepMHz
        : minFreq + Math.floor((cfValue - minFreq) / stepMHz) * stepMHz;
      setValue(snapped);
      setErrorMessage(validate(snapped));
      return;
    }
    setValue(cfValue);
    setErrorMessage(validate(cfValue));
  };

  return (
    <TextField
      type="number"
      variant="standard"
      fullWidth
      required
      disabled={disabled}
      label={t(FIELD + '.label')}
      value={value}
      onChange={(e) => checkValue(Number(e.target.value))}
      error={!!errorMessage}
      helperText={errorMessage}
      onFocus={() => setHelp(FIELD)}
      slotProps={{
        htmlInput: {
          step: isLow ? stepMHz : 1,
          min: minFreq,
          max: maxFreq
        },
        input: suffix ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> } : undefined
      }}
    />
  );
}
