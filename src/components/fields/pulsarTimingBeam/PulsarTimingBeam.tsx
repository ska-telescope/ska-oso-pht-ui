import React, { useState } from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, Box } from '@mui/material';

type Choice = 'No Beam' | 'Multiple Beams';

interface PulsarTimingBeamFieldProps {
  labelWidth?: number;
  setValue?: Function;
  value: String;
  valueFocus?: Function;
}

export default function PulsarTimingBeamField({
  labelWidth = 5,
  setValue,
  value,
  valueFocus
}: PulsarTimingBeamFieldProps) {
  const PulsarTimingBeamField = () => {
    const [selected, setSelected] = useState<Choice>('No Beam');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelected(event.target.value as Choice);
    };
    return (
      <Box pt={1}>
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="No Beam"
            name="radio-buttons-group"
          >
            <FormControlLabel value="No Beam" control={<Radio />} label="No Beam" />
            <FormControlLabel value="Multiple Beams" control={<Radio />} label="Multiple Beams" />
          </RadioGroup>
        </FormControl>
      </Box>
    );
  };

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      {PulsarTimingBeamField()}
    </Box>
  );
}
