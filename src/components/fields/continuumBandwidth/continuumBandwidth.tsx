import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import {
  BANDWIDTH_TELESCOPE,
  LAB_IS_BOLD,
  LAB_POSITION,
  OBSERVATION
} from '../../../utils/constants';
import sensCalHelpers from '../../../services/axios/sensitivityCalculator/sensCalHelpers';

interface continuumBandwidthFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
  suffix?: any; // TODO figure out sufix type
  telescope?: number;
  observingBand?: number;
  continuumBandwidthUnits?: number;
}

interface Limits {
  upper: number;
  lower: number;
  units: string;
}

export default function ContinuumBandwidthField({
  labelWidth = 5,
  onFocus,
  setValue,
  value,
  suffix,
  telescope,
  observingBand,
  continuumBandwidthUnits
}: continuumBandwidthFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'continuumBandwidth2';

  console.log('telescope', telescope);
  console.log('observingBand', observingBand);
  console.log('continuumBandwidthUnits', continuumBandwidthUnits);
  console.log('suffix', suffix);

  const findBandwidthLimits = (): Limits => {
    const bandWidthData = BANDWIDTH_TELESCOPE.find(item => item.value === observingBand);
    return {
      upper: bandWidthData.upper,
      lower: bandWidthData.lower,
      units: bandWidthData.units
    };
  };
  const convertContinuumBandwidthToLimitUnits = (limits: Limits): number => {
    const continuumBandwidthUnitsLabel = OBSERVATION.array
      .find(item => item.value === telescope)
      ?.centralFrequencyAndBandWidthUnits.find(u => u.value === continuumBandwidthUnits)?.label;
    switch (limits.units) {
      case 'MHz':
        return sensCalHelpers.format.convertBandwidthToMHz(value, continuumBandwidthUnitsLabel);
      case 'GHz':
        return sensCalHelpers.format.convertBandwidthToGHz(value, continuumBandwidthUnitsLabel);
      default:
        return value;
    }
  };
  const errorMessage = () => {
    const limits = findBandwidthLimits();
    const convertedBandwidth = convertContinuumBandwidthToLimitUnits(limits);
    console.log('convertedBandwidth', convertedBandwidth);
    if (convertedBandwidth > limits.upper) {
      return t('continuumBandWidth.range.error');
    }
    if (convertedBandwidth < limits.lower) {
      return t('continuumBandWidth.range.error');
    }
    return '';
    // TODO find bandwidth limit calculaions in the sens calc
    // TODO : handle band5a NaN cases
    // TODO : handle zooms
  };
  /*
      const validate = (e: React.SetStateAction<number>) => {
        setContinuumBandwidth(Number(e) < 0 ? 0 : e);
      };
      */

  return (
    <NumberEntry
      label={t('continuumBandWidth.label')}
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      suffix={suffix}
      testId={FIELD}
      value={value}
      // setValue={validate}
      setValue={setValue}
      onFocus={onFocus}
      required
      errorText={errorMessage()}
    />
  );
}
