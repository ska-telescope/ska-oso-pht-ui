import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { FREQUENCY_UNITS, LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { calculateVelocity, frequencyConversion } from '../../../utils/helpers';
import { Box } from '@mui/system';

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

  const calculateEffectiveResolution = () => {
    const arr = String(spectralResolution).split(' ');
    if (arr.length > 2) {
      const resolution = Number(arr[0]);
      const resolutionUnits = FREQUENCY_UNITS.find(e => e.label === arr[1]).value;
      const freq = frequencyConversion(frequency, frequencyUnits);
      const ave = resolution * spectralAveraging;
      const velocity = calculateVelocity(frequencyConversion(ave, resolutionUnits) * 10, freq);
      return `${ave.toFixed(2)} ${arr[1]} (${velocity})`;
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
    <Box pt={1}>
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
    </Box>
  );
}
