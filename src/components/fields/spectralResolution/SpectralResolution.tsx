import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { BAND_LOW, LAB_IS_BOLD, LAB_POSITION, TYPE_CONTINUUM } from '../../../utils/constants';
import { calculateVelocity, getScaledValue } from '../../../utils/helpers';

// TODO : Currently we pass in the frequency units, but we do not take note of them as part of the calculations.

interface SpectralResolutionFieldProps {
  bandWidth: number;
  frequency: number;
  frequencyUnits: number;
  label?: string;
  labelWidth?: number;
  observingBand: number;
  observationType: number;
  onFocus?: Function;
  setValue?: Function;
}

export default function SpectralResolutionField({
  bandWidth,
  frequency,
  frequencyUnits,
  label = '',
  labelWidth = 6,
  observingBand,
  observationType,
  onFocus = null,
  setValue = null
}: SpectralResolutionFieldProps) {
  const [spectralResolution, setSpectralResolution] = React.useState('');

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === BAND_LOW;

  const LOWContinuumBase = () => 5.43;
  const LOWZoomBase = () => {
    const powersTwo = [1, 2, 4, 8, 16, 32, 64, 128];
    // const powersTwo2 = [16, 32, 64, 128];
    const results = powersTwo.map(obj => obj * 0.21);
    return results[bandWidth - 1];
  };

  const MIDContinuumBase = () => 13.44;
  const MIDZoomBase = () => {
    const results = [0.21, 0.42, 0.84, 1.68, 3.36, 6.72, 13.44];
    return results[bandWidth - 1];
  };

  const LOWBase = () => (isContinuum() ? LOWContinuumBase() : LOWZoomBase());
  const MIDBase = () => (isContinuum() ? MIDContinuumBase() : MIDZoomBase());
  const getBaseValue = () => (isLow() ? LOWBase() : MIDBase());
  const getUnits1 = () => (isLow() ? (isContinuum() ? 'kHz' : 'Hz') : 'kHz');

  const calculateLOW = () =>
    calculateVelocity(getBaseValue(), frequency * (isContinuum() ? 1000 : 1e6));

  const calculateMID = () => {
    if (isContinuum()) {
      const freq = getScaledValue(frequency, 1000000000, '*');
      return calculateVelocity(getBaseValue() * 1000, freq);
    } else {
      const freq = getScaledValue(frequency, 1000000000, '*');
      return calculateVelocity(getBaseValue() * 1000, freq);
    }
  };

  const calculate = () => {
    return isLow() ? calculateLOW() : calculateMID();
  };

  React.useEffect(() => {
    setSpectralResolution(`${getBaseValue()} ${getUnits1()} (${calculate()})`);
    if (setValue !== null) {
      setValue(spectralResolution);
    }
  }, []);

  React.useEffect(() => {
    setSpectralResolution(`${getBaseValue()} ${getUnits1()} (${calculate()})`);
    if (setValue !== null) {
      setValue(spectralResolution);
    }
  }, [bandWidth, frequency, frequencyUnits, observingBand, observationType]);

  const roundSpectralResolution = (res: string) => {
    const spaceIndex = res.indexOf(' ');
    if (spaceIndex >= 0) {
      const numberStr = res.substring(0, spaceIndex);
      const number = Number(numberStr);
      if (!isNaN(number)) {
        const roundedNumber = number.toFixed(1);
        const unitStr = res.substring(spaceIndex);
        return roundedNumber + unitStr;
      }
    }
    return res;
  };

  return (
    <TextEntry
      disabled
      label={label}
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      onFocus={onFocus}
      testId="spectralResolution"
      value={
        !isContinuum() && observingBand === BAND_LOW
          ? roundSpectralResolution(spectralResolution)
          : spectralResolution
      }
    />
  );
}
