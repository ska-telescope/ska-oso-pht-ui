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
    const baseSpectralResolutionHz = (781250 * 32) / 27 / 4096 / 16;
    const results = powersTwo.map(obj => obj * baseSpectralResolutionHz);
    return (results[bandWidth - 1].toFixed(2) as unknown) as number;
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
      return calculateVelocity(getBaseValue() * 1000, getScaledValue(bandWidth, 1000000000, '*'));
    } else {
      const freq = getScaledValue(frequency, 1000000000, '*');
      return calculateVelocity(getBaseValue() * 1000, freq);
    }
  };

  const calculate = () => {
    return isLow() ? calculateLOW() : calculateMID();
  };

  const getDisplay = () => {
    setSpectralResolution(`${getBaseValue()} ${getUnits1()} (${calculate()})`);
    if (setValue !== null) {
      setValue(spectralResolution);
    }
  };

  React.useEffect(() => {
    getDisplay();
  }, []);

  React.useEffect(() => {
    getDisplay();
  }, [bandWidth, frequency, frequencyUnits, observingBand, observationType]);

  return (
    <TextEntry
      disabled
      label={label}
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      onFocus={onFocus}
      testId="spectralResolution"
      value={spectralResolution}
    />
  );
}
