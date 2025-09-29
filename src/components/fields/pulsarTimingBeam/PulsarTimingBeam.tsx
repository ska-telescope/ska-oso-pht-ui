import React from 'react';
import { Radio, FormControlLabel } from '@mui/material';

export default function PulsarTimingBeamField() {
  const [selectedValue, setSelectedValue] = React.useState('noBeam');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const controlProps = (item: string) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    name: 'color-radio-button-demo',
    inputProps: { 'aria-label': item }
  });

  return (
    <div>
      <FormControlLabel
        control={<Radio {...controlProps('noBeam')} color="default" />}
        //TODO: Use translation
        label="No Beam"
        data-testid="No BeamTestId"
      />
      <FormControlLabel
        control={<Radio {...controlProps('multipleBeams')} color="default" />}
        //TODO: Use translation
        label="Multiple Beams"
        data-testid="Multiple BeamsTestId"
      />
    </div>
  );
}
