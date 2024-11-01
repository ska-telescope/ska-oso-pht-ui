import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { BAND_LOW, LAB_IS_BOLD, LAB_POSITION, TYPE_CONTINUUM } from '../../../utils/constants';
import { calculateVelocity, getScaledValue } from '../../../utils/helpers';

interface EffectiveResolutionFieldProps {
  frequency: number;
  frequencyUnits: number;
  label?: string;
  labelWidth?: number;
  observingBand: number;
  observationType: number;
  onFocus?: Function;
  setValue?: Function;
  spectralAveraging: number;
  spectralResolution: string;
}

export default function EffectiveResolutionField({
  frequency,
  frequencyUnits,
  label = '',
  labelWidth = 6,
  observingBand,
  observationType,
  onFocus = null,
  setValue = null,
  spectralAveraging,
  spectralResolution
}: EffectiveResolutionFieldProps) {
  const [effectiveResolution, setEffectiveResolution] = React.useState('');

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === BAND_LOW;

  const calculateEffectiveResolution = () => {
    const arr = String(spectralResolution).split(' ');
    if (arr.length > 2) {
      const resolution = Number(arr[0]);
      const effectiveResolutionValue = resolution * spectralAveraging;
      const freqMultiplier = isLow() ? 1000000 : 1000000000;
      const freq = getScaledValue(frequency, freqMultiplier, '*');
      // const freq = frequencyConversion(inValue, inUnits, 4); // Converting to Hz
      const decimal = isContinuum() ? 2 : 1;
      const multiplier = !isLow() || isContinuum() ? 1000 : 1;
      const velocity = calculateVelocity(effectiveResolutionValue * multiplier, freq);
      return `${(resolution * spectralAveraging).toFixed(decimal)} ${arr[1]} (${velocity})`;
    } else {
      return '';
    }
  };

  const getDisplay = () => {
    setEffectiveResolution(calculateEffectiveResolution());
    if (setValue !== null) {
      setValue(spectralResolution);
    }
  };

  React.useEffect(() => {
    getDisplay();
  }, []);

  React.useEffect(() => {
    getDisplay();
  }, [
    frequency,
    frequencyUnits,
    observingBand,
    observationType,
    spectralAveraging,
    spectralResolution
  ]);

  return (
    <TextEntry
      disabled
      label={label}
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      onFocus={onFocus}
      testId="effectiveResolution"
      value={effectiveResolution}
    />
  );
}
