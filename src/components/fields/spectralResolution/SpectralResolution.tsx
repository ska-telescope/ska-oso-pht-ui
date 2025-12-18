import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import {
  BAND_LOW_STR,
  FREQUENCY_UNITS,
  LAB_IS_BOLD,
  LAB_POSITION,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import { calculateVelocity, frequencyConversion } from '../../../utils/helpers';

interface SpectralResolutionFieldProps {
  bandWidth: number;
  bandWidthUnits: number;
  frequency: number;
  frequencyUnits: number;
  label?: string;
  labelWidth?: number;
  observingBand: string;
  observationType: number;
  onFocus?: Function;
  setValue?: Function;
}

export default function SpectralResolutionField({
  bandWidth,
  bandWidthUnits,
  frequency,
  frequencyUnits,
  label = '',
  labelWidth = 6,
  observingBand,
  observationType,
  onFocus,
  setValue
}: SpectralResolutionFieldProps) {
  const [spectralResolution, setSpectralResolution] = React.useState('');

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === BAND_LOW_STR;

  const LOWContinuumBase = () => 5.43;
  const LOWZoomBase = () => {
    const powersTwo = [1, 2, 4, 8, 16, 32, 64, 128];
    const baseSpectralResolutionHz = (781250 * 32) / 27 / 4096 / 16;
    const results = powersTwo.map(obj => obj * baseSpectralResolutionHz);
    return (results[bandWidth - 1]?.toFixed(2) as unknown) as number;
  };

  const MIDContinuumBase = () => 13.44;
  const MIDZoomBase = () => {
    const results = [0.21, 0.42, 0.84, 1.68, 3.36, 6.72, 13.44];
    return results[bandWidth - 1];
  };

  const LOWBase = () => (isContinuum() ? LOWContinuumBase() : LOWZoomBase());
  const MIDBase = () => (isContinuum() ? MIDContinuumBase() : MIDZoomBase());
  const getBaseValue = () => (isLow() ? LOWBase() : MIDBase());
  const getUnits1 = () =>
    isLow()
      ? isContinuum()
        ? FREQUENCY_UNITS[2].label
        : FREQUENCY_UNITS[3].label
      : FREQUENCY_UNITS[2].label;

  const calculateLOW = () =>
    calculateVelocity(getBaseValue(), frequency * (isContinuum() ? 1000 : 1e6));

  const calculateMID = () => {
    const freq = frequencyConversion(frequency, frequencyUnits);
    return calculateVelocity(getBaseValue() * 1000, freq);
  };

  const calculate = () => {
    return isLow() ? calculateLOW() : calculateMID();
  };

  const getDisplay = () => {
    setSpectralResolution(`${getBaseValue()} ${getUnits1()} (${calculate()})`);
    if (setValue) {
      setValue(`${getBaseValue()} ${getUnits1()} (${calculate()})`);
    }
  };

  React.useEffect(() => {
    getDisplay();
  }, []);

  React.useEffect(() => {
    getDisplay();
  }, [bandWidth, bandWidthUnits, frequency, frequencyUnits, observingBand, observationType]);

  return (
    <Box pt={1}>
      <TextEntry
        disabled
        disabledUnderline
        label={label}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        onFocus={onFocus}
        testId="spectralResolution"
        value={spectralResolution}
      />
    </Box>
  );
}
