import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import {
  FREQUENCY_UNITS,
  LAB_IS_BOLD,
  LAB_POSITION,
  OBSERVATION,
  TELESCOPE_LOW_NUM,
  TYPE_ZOOM
} from '../../../../utils/constants';
import sensCalHelpers from '../../../../services/axios/sensitivityCalculator/sensCalHelpers';
import {
  scaleBandwidthOrFrequency,
  getMaxContBandwidthHz,
  checkMinimumChannelWidth,
  checkMaxContBandwidthHz,
  checkBandLimits
} from '../bandwidthValidationCommon';

interface BandwidthFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  testId: string;
  telescope: number;
  value: number;
  widthButton?: number;
  widthLabel?: number;
  observingBand?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: number;
  setScaledBandwidth?: Function;
  minimumChannelWidthHz?: number;
}

export default function BandwidthField({
  disabled = false,
  onFocus,
  required = false,
  setValue,
  suffix = null,
  value,
  telescope,
  testId,
  widthButton = 50,
  widthLabel = 5,
  observingBand = 0,
  centralFrequency = 0,
  centralFrequencyUnits,
  subarrayConfig = 0,
  setScaledBandwidth,
  minimumChannelWidthHz = 0
}: BandwidthFieldProps) {
  const { t } = useTranslation('pht');
  const isLow = () => telescope === TELESCOPE_LOW_NUM;

  const getOptions = () => {
    return OBSERVATION.array[telescope - 1].bandWidth;
  };
  const roundBandwidthValue = (options: any[]) =>
    options.map((obj: { label: string; value: any; mapping: any }) => {
      return {
        label: `${parseFloat(obj.label).toFixed(1)} ${obj.label.split(' ')[1]}`,
        value: obj.value,
        mapping: obj.mapping
      };
    });

  const lookupBandwidth = (inValue: number): any =>
    OBSERVATION.array[telescope - 1]?.bandWidth.find(bw => bw.value === inValue);

  const getBandwidthUnitsLabel = (): string => {
    return lookupBandwidth(value)?.mapping;
  };

  const getBandwidthValue = (): number => {
    return Number(lookupBandwidth(value)?.label.split(' ')[0]);
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

  const errorMessage = () => {
    const bandwidthUnitsLabel = getBandwidthUnitsLabel();
    const bandwidthValue = getBandwidthValue();
    const frequencyUnitsLabel = getFrequencyUnitsLabelFunc();
    const scaledBandwidth = scaleBandwidthOrFrequency(bandwidthValue, bandwidthUnitsLabel);
    if (setScaledBandwidth) {
      setScaledBandwidth(scaledBandwidth);
    }
    const scaledFrequency = scaleBandwidthOrFrequency(centralFrequency, frequencyUnitsLabel ?? '');

    if (!checkMinimumChannelWidth(minimumChannelWidthHz, scaledBandwidth)) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }

    const maxContBandwidthHz: number = getMaxContBandwidthHz(telescope, subarrayConfig);
    if (!checkMaxContBandwidthHz(maxContBandwidthHz, scaledBandwidth)) {
      return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }

    if (
      !checkBandLimits(scaledBandwidth, scaledFrequency, telescope, subarrayConfig, observingBand)
    ) {
      return t('bandwidth.range.rangeError');
    }

    return '';
  };

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} item xs={suffix ? 12 - widthButton : 12}>
        <DropDown
          disabled={disabled}
          options={isLow() ? roundBandwidthValue(getOptions()) : getOptions()}
          testId={testId}
          value={value}
          setValue={setValue}
          label={t(`bandwidth.label.${TYPE_ZOOM}`)}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? widthLabel + 1 : widthLabel}
          onFocus={onFocus}
          required={required}
          errorText={errorMessage()}
        />
      </Grid>
      <Grid item xs={suffix ? widthButton : 0}>
        {suffix}
      </Grid>
    </Grid>
  );
}
