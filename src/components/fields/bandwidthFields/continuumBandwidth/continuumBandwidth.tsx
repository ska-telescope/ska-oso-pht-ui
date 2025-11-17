import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_IS_BOLD, LAB_POSITION, TYPE_CONTINUUM } from '@utils/constants.ts';
import { getScaledBandwidthOrFrequency } from '@utils/helpers.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import sensCalHelpers from '../../../../services/api/sensitivityCalculator/sensCalHelpers';
import {
  getMaxContBandwidthHz,
  checkMinimumChannelWidth,
  checkMaxContBandwidthHz,
  checkBandLimits
} from '../bandwidthValidationCommon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface continuumBandwidthFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
  suffix?: any;
  telescope?: number;
  observingBand?: number;
  continuumBandwidthUnits?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: number;
  minimumChannelWidthHz?: number;
}

export default function ContinuumBandwidthField({
  labelWidth = 5,
  onFocus,
  setValue,
  value,
  suffix,
  telescope,
  observingBand,
  continuumBandwidthUnits,
  centralFrequency,
  centralFrequencyUnits,
  subarrayConfig,
  minimumChannelWidthHz
}: continuumBandwidthFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'continuumBandwidth';

  const { osdMID, osdLOW, observatoryConstants } = useOSDAccessors();

  const displayMinimumChannelWidthErrorMessage = (
    minimumChannelWidthHz: number | undefined
  ): string => {
    const minimumChannelWidthKHz = sensCalHelpers.format
      .convertBandwidthToKHz(minimumChannelWidthHz as number, 'Hz')
      .toFixed(2);
    return t('bandwidth.range.minimumChannelWidthError', {
      value: minimumChannelWidthKHz
    });
  };

  const displayMaxContBandwidthErrorMessage = (maxContBandwidthHz: number | undefined): string => {
    const maxContBandwidthMHz = sensCalHelpers.format
      .convertBandwidthToMHz(maxContBandwidthHz as number, 'Hz')
      .toFixed(2);
    return t('bandwidth.range.contMaximumExceededError', { value: maxContBandwidthMHz });
  };

  const errorMessage = () => {
    const scaledBandwidth = getScaledBandwidthOrFrequency(value, continuumBandwidthUnits ?? 0);
    const scaledFrequency = getScaledBandwidthOrFrequency(centralFrequency, centralFrequencyUnits);
    const maxContBandwidthHz: number | undefined = getMaxContBandwidthHz(
      telescope as number,
      subarrayConfig as number,
      osdMID,
      osdLOW,
      observatoryConstants
    );
    const result1 = !checkMinimumChannelWidth(minimumChannelWidthHz as number, scaledBandwidth);
    const result2 = !checkMaxContBandwidthHz(maxContBandwidthHz, scaledBandwidth);
    const result3 = !checkBandLimits(
      scaledBandwidth,
      scaledFrequency,
      telescope as number,
      subarrayConfig as number,
      observingBand as number,
      osdMID,
      osdLOW,
      observatoryConstants
    );
    if (result1) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }
    if (result2) {
      return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }
    if (result3) {
      return t('bandwidth.range.rangeError');
    }
    return '';
  };

  return (
    <Box pt={1}>
      <NumberEntry
        label={t(`bandwidth.label.${TYPE_CONTINUUM}`)}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        suffix={suffix}
        testId={FIELD}
        value={value}
        setValue={setValue}
        onFocus={onFocus}
        required
        errorText={errorMessage()}
      />
    </Box>
  );
}
