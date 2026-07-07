import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import {
  BAND_LOW_STR,
  FIRST_COARSE_ZOOM,
  FREQUENCY_UNITS,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import { calculateVelocity, frequencyConversion } from '../../../utils/helpers';
import {
  getZoomResolutionHz,
  getZoomResolutionOptions,
  isFineZoomRestricted
} from '../../../utils/zoomWindow';
import SelectField from '../../wrappers/selectField/SelectField';

interface SpectralResolutionFieldProps {
  bandWidth: number;
  bandWidthUnits: number;
  frequency: number;
  frequencyUnits: number;
  interactive?: boolean;
  label?: string;
  observingBand: string;
  observationType: string;
  onFocus?: Function;
  setBandWidth?: (value: number) => void;
  setValue?: Function;
  subarrayConfig?: string;
}

export default function SpectralResolutionField({
  bandWidth,
  bandWidthUnits,
  frequency,
  frequencyUnits,
  interactive = false,
  label = '',
  observingBand,
  observationType,
  onFocus,
  setBandWidth,
  setValue,
  subarrayConfig = ''
}: SpectralResolutionFieldProps) {
  const [spectralResolution, setSpectralResolution] = React.useState('');

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === BAND_LOW_STR;

  // For AA2/AA* subarrays, the fine zoom modes are not available,
  // if one of those is selected, we fall back to the coarsest one both for what's displayed and what gets propagated to the parent.
  const restricted = interactive && isFineZoomRestricted(subarrayConfig);
  const safeBandWidth = restricted && bandWidth < FIRST_COARSE_ZOOM ? FIRST_COARSE_ZOOM : bandWidth;

  React.useEffect(() => {
    if (restricted && bandWidth < FIRST_COARSE_ZOOM) {
      setBandWidth?.(FIRST_COARSE_ZOOM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subarrayConfig, bandWidth, interactive]);

  const LOWContinuumBase = () => 5.43;
  const LOWZoomBase = () => Number(getZoomResolutionHz(safeBandWidth).toFixed(2));

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

  const calculateLOW = () => {
    return calculateVelocity(getBaseValue(), frequency * (isContinuum() ? 1000 : 1e6));
  };

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
      {interactive ? (
        <SelectField
          testId="spectralResolution"
          label={label}
          options={getZoomResolutionOptions(subarrayConfig)}
          value={safeBandWidth}
          setValue={(value) => setBandWidth?.(value)}
          onFocus={() => onFocus?.()}
        />
      ) : (
        <TextEntry
          disabled
          disabledUnderline
          label={label}
          onFocus={onFocus}
          testId="spectralResolution"
          value={spectralResolution}
        />
      )}
    </Box>
  );
}
