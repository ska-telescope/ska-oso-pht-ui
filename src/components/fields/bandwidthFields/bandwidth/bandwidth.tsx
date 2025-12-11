import React from 'react';
import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import {
  ERROR_SECS,
  FREQUENCY_UNITS,
  LAB_IS_BOLD,
  LAB_POSITION,
  TELESCOPE_LOW_NUM,
  TYPE_PST,
  TYPE_ZOOM
} from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import sensCalHelpers from '../../../../services/api/sensitivityCalculator/sensCalHelpers';
import {
  scaleBandwidthOrFrequency,
  getMaxContBandwidthHz,
  checkMinimumChannelWidth,
  checkMaxContBandwidthHz,
  checkBandLimits
} from '../bandwidthValidationCommon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface BandwidthFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  telescope: number;
  value: number;
  widthButton?: number;
  widthLabel?: number;
  observingBand?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: number;
  minimumChannelWidthHz?: number;
  observationType?: number;
}

export default function BandwidthField({
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  telescope,
  widthButton = 50,
  widthLabel = 5,
  observingBand = 0,
  centralFrequency = 0,
  centralFrequencyUnits = 1,
  subarrayConfig = 0,
  minimumChannelWidthHz = 0,
  observationType = TYPE_ZOOM
}: BandwidthFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const { osdMID, osdLOW, observatoryConstants } = useOSDAccessors();
  const FIELD = 'bandwidth';

  const [errorText, setErrorText] = React.useState('');

  const isLow = () => telescope === TELESCOPE_LOW_NUM;

  const getOptions = () => {
    return observatoryConstants.array[telescope - 1].bandWidth;
  };
  const roundBandwidthValue = (options: any[]) =>
    options.map((obj: { label: string; value: any; mapping: any }) => {
      return {
        label: `${parseFloat(obj.label).toFixed(1)} ${obj.label.split(' ')[1]}`,
        value: obj.value,
        mapping: obj.mapping
      };
    });

  const lookupBandwidth = (inValue: number): any => {
    return observatoryConstants.array[telescope - 1]?.bandWidth.find(bw => bw.value === inValue);
  };

  const getBandwidthUnitsLabel = (): string => {
    return lookupBandwidth(centralFrequencyUnits)?.mapping;
  };

  const getBandwidthValue = (): number => {
    const bw = lookupBandwidth(value);
    if (!bw?.label) return 0; // fallback if lookup fails

    const parts = bw.label.split(' ');
    const num = Number(parts[0]);

    return isNaN(num) ? 0 : num; // fallback if conversion fails
  };

  const getFrequencyUnitsLabelFunc = () =>
    FREQUENCY_UNITS.find(item => item.value === centralFrequencyUnits)?.label;

  const displayMinimumChannelWidthErrorMessage = (minimumChannelWidthHz: number): string => {
    const minimumChannelWidthKHz = sensCalHelpers.format
      .convertBandwidthToKHz(minimumChannelWidthHz, 'Hz')
      .toFixed(2);
    return t('bandwidth.range.minimumChannelWidthError', {
      value: minimumChannelWidthKHz
    });
  };

  const displayMaxContBandwidthErrorMessage = (maxContBandwidthHz: number): string => {
    const maxContBandwidthMHz = sensCalHelpers.format
      .convertBandwidthToMHz(maxContBandwidthHz, 'Hz')
      .toFixed(2);
    return t('bandwidth.range.contMaximumExceededError', { value: maxContBandwidthMHz });
  };

  const validateValue = () => {
    const bandwidthUnitsLabel = getBandwidthUnitsLabel();
    const bandwidthValue = getBandwidthValue();
    const frequencyUnitsLabel = getFrequencyUnitsLabelFunc();
    const scaledBandwidth = scaleBandwidthOrFrequency(bandwidthValue, bandwidthUnitsLabel);
    const scaledFrequency = scaleBandwidthOrFrequency(centralFrequency, frequencyUnitsLabel ?? '');

    if (!checkMinimumChannelWidth(minimumChannelWidthHz, scaledBandwidth)) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }

    const maxContBandwidthHz: number = getMaxContBandwidthHz(
      telescope,
      subarrayConfig,
      osdMID,
      osdLOW,
      observatoryConstants
    );
    if (!checkMaxContBandwidthHz(maxContBandwidthHz, scaledBandwidth)) {
      return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }

    if (
      !checkBandLimits(
        scaledBandwidth,
        scaledFrequency,
        telescope,
        subarrayConfig,
        observingBand,
        osdMID,
        osdLOW,
        observatoryConstants
      )
    ) {
      return t('bandwidth.range.rangeError');
    }

    return '';
  };

  // Whenever value changes, validate and possibly show error
  React.useEffect(() => {
    const msg = validateValue();
    setErrorText(msg);

    if (msg) {
      const timer = setTimeout(() => {
        setErrorText('');
      }, ERROR_SECS);
      return () => clearTimeout(timer);
    }
  }, [value, telescope, subarrayConfig, observingBand, centralFrequency, centralFrequencyUnits]);

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled}
          options={isLow() ? roundBandwidthValue(getOptions()) : getOptions()}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={
            observationType === TYPE_PST
              ? t(FIELD + '.label.' + TYPE_PST)
              : t(FIELD + '.label.' + TYPE_ZOOM)
          }
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? widthLabel + 1 : widthLabel}
          onFocus={() => setHelp(FIELD)}
          required={required}
          errorText={errorText}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
